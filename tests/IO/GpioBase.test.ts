import GpioBase from '../../src/lib/IO/GpioBase';
import { GpioPins } from '../../src/lib/IO/GpioPins';
import { PinMode } from '../../src/lib/IO/PinMode';
import { PinState } from '../../src/lib/IO/PinState';
import PinStateChangeEvent from '../../src/lib/IO/PinStateChangeEvent';
import { BoardRevision } from '../../src/lib/BoardRevision';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';

class FakeGpio extends GpioBase {
    private overriddenState: PinState;

    constructor(pin: GpioPins | null, mode?: PinMode, value?: PinState) {
        super(pin, mode, value);
        this.overriddenState = super.getInitialPinValue();
    }

    public async read() {
        await super.read();
        return this.overriddenState;
    }

    public async write(ps: PinState) {
        await super.write(ps);

        if (this.overriddenState !== ps) {
            const addr = this.innerPin.valueOf();
            const evt = new PinStateChangeEvent(this.overriddenState, ps, addr);
            this.overriddenState = ps;
            this.onPinStateChange(evt);
        }
    }
}

test("GPIO Disposes", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.isDisposed).toBeFalsy();

    fg.dispose();
    expect(fg.isDisposed).toBeTruthy();

    fg.dispose(); // Call it again for the coverage.
    expect(fg.isDisposed).toBeTruthy();
});

test("Changes board revision", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.revision).toBe(BoardRevision.Rev2);

    fg.changeBoardRevision(BoardRevision.Rev1);
    expect(fg.revision).toBe(BoardRevision.Rev1);
});

test("Can read state", async () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    const val = await fg.read();
    expect(val).toBe(PinState.LOW);

    fg.dispose();
    const err = new ObjectDisposedException("GpioBase");
    await expect(fg.read()).rejects.toThrow(err);
});

test("Can provision pin", async () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.HIGH);
    fg.provision();

    const val = await fg.read();
    expect(val).toBe(PinState.HIGH);
});

test("Can get pin address", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.HIGH);
    expect(fg.address).toBe(GpioPins.GPIO01.valueOf());
});

test("Can get initial value", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.HIGH);
    expect(fg.getInitialPinValue()).toBe(PinState.HIGH);
});

test("Can write pin state", async () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    let val = await fg.read()
    expect(val).toBe(PinState.LOW);

    await fg.write(PinState.HIGH);
    val = await fg.read();
    expect(val).toBe(PinState.HIGH);

    fg.dispose();
    const err = new ObjectDisposedException("GpioBase");
    await expect(fg.write(PinState.LOW)).rejects.toThrow(err);
});

test("Can get inner pin and pin name", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.innerPin).toBe(GpioPins.GPIO01);
    expect(fg.pinName).toBe(GpioPins[GpioPins.GPIO01]);
});

test("Can change pin mode", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.mode).toBe(PinMode.IN);

    fg.mode = PinMode.IN;  // Do it again for coverage.
    expect(fg.mode).toBe(PinMode.IN);
    
    fg.mode = PinMode.OUT;
    expect(fg.mode).toBe(PinMode.OUT);

    fg.dispose();
    const err = new ObjectDisposedException("GpioBase");
    expect(() => { fg.mode = PinMode.IN }).toThrow(err);
});

test("Can change tag", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.tag).toBeNull();

    const errObj = new Error("test");
    fg.tag = errObj;
    expect(fg.tag).toBe(errObj);
});

test("Can change PWM", async () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.pwm).toBe(0);

    await fg.setPwm(25);
    expect(fg.pwm).toBe(25);
});

test("Can change PWM range", () => {
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect(fg.pwmRange).toBe(0);

    fg.pwmRange = 25;
    expect(fg.pwmRange).toBe(25);
});

test("Can respond to state change events", async () => {
    const listener = (pse: PinStateChangeEvent) => {
        expect(pse.oldState).toBe(PinState.LOW);
        expect(pse.newState).toBe(PinState.HIGH);
        expect(pse.pinAddress).toBe(GpioPins.GPIO01.valueOf());
    };

    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    let subscription = fg.addPinStateChangeListener(listener);
    await fg.write(PinState.HIGH);
    subscription.remove();

    fg.dispose();
    const err = new ObjectDisposedException("GpioBase");

    expect(() => { 
        subscription = fg.addPinStateChangeListener(listener);
    }).toThrow(err);

    expect(() => {
        const fakeEvt = new PinStateChangeEvent(PinState.LOW, PinState.HIGH, GpioPins.GPIO01);
        fg.onPinStateChange(fakeEvt);
    }).toThrow(err);
});

test("Can pulse pin", async () => {
    let secondCall = false;
    const fg = new FakeGpio(GpioPins.GPIO01, PinMode.IN, PinState.LOW);
    expect.assertions(7);
    const listener = (pse: PinStateChangeEvent) => {
        if (secondCall) {
            expect(pse.oldState).toBe(PinState.HIGH);
            expect(pse.newState).toBe(PinState.LOW);
            expect(pse.pinAddress).toBe(GpioPins.GPIO01.valueOf());
        }
        else {
            expect(pse.oldState).toBe(PinState.LOW);
            expect(pse.newState).toBe(PinState.HIGH);
            expect(pse.pinAddress).toBe(GpioPins.GPIO01.valueOf());
            secondCall = true;
        }
    };

    const sub = fg.addPinStateChangeListener(listener);
    await fg.pulse(500);
    
    sub.remove();
    fg.dispose();
    const err = new ObjectDisposedException("GpioBase");
    await expect(fg.pulse(500)).rejects.toThrow(err);
});

test("Constructs with default values", () => {
    const fg = new FakeGpio(null);
    expect(fg.innerPin).toBe(GpioPins.GPIO_NONE);
    expect(fg.getInitialPinValue()).toBe(PinState.LOW);
    expect(fg.mode).toBe(PinMode.OUT);
    expect(fg.state).toBe(PinState.LOW);
});