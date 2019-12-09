import SPI from 'pi-spi';
import * as Util from 'util';

export enum mode {
    CPHA = 0x01,
    CPOL = 0x02
}

export enum order {
    MSB_FIRST = 0,
    LSB_FIRST = 1
}

export type SpiCallback = (error: Error, data: Buffer) => void;

export interface ISpiBus {
    clockSpeed(): number;
    clockSpeed(speed: number): void;

    dataMode(): number;
    dataMode(mode: mode): void;

    bitOrder(): number;
    bitOrder(order: order): void;


    write(writebuf: Buffer, cb: SpiCallback): void;
    read(readcount: number, cb: (error: Error, data: Buffer) => void): void;

    transfer(writebuf: Buffer, cb: SpiCallback): void;
    transfer(writebuf: Buffer, readcount: number, cb: SpiCallback): void;

    close(cb: (error: Error) => void): void;
}

export class SpiBus implements ISpiBus {
    private devName: string;
    private clkSpeed: number;
    private datMode: mode;
    private busBitOrder: order;
    private data?: Buffer;

    constructor(device: string) {
        this.devName = device;
        this.clkSpeed = 0;
        this.datMode = mode.CPHA;
        this.busBitOrder = order.LSB_FIRST;
        this.data = undefined;
    }

    public clockSpeed(): number;
    public clockSpeed(speed: number): void;
    public clockSpeed(speed?: number): number | void {
        if (!Util.isNullOrUndefined(speed)) {
            this.clkSpeed = speed;
            return;
        }

        return this.clkSpeed;
    }

    public dataMode(): number;
    public dataMode(mode: mode): void;
    public dataMode(mode?: mode): number | void {
        if (!Util.isNullOrUndefined(mode)) {
            this.datMode = mode;
            return;
        }

        return this.datMode;
    }

    public bitOrder(): number;
    public bitOrder(order: order): void;
    public bitOrder(order?: order): number | void {
        if (!Util.isNullOrUndefined(order)) {
            this.busBitOrder = order;
            return;
        }

        return this.busBitOrder;
    }

    public write(writebuf: Buffer, cb: SpiCallback): void {
        this.transfer(writebuf, cb);
    }

    public read(readcount: number, cb: SpiCallback): void {
        if (!!!this.data) {
            this.data = Buffer.from("test");
        }
        this.transfer(this.data, readcount, cb);
    }

    public transfer(writebuf: Buffer, cb: SpiCallback): void;
    public transfer(writebuf: Buffer, readcount: number, cb: SpiCallback): void;
    public transfer(writebuf: Buffer, readCountOrCallbackParam: number | SpiCallback, cb?: SpiCallback): void {
        this.data = writebuf;
        if (typeof readCountOrCallbackParam === 'number') {
            cb && cb(new Error("no error"), this.data && this.data.subarray(0, readCountOrCallbackParam - 1));
            return;
        }

        readCountOrCallbackParam(new Error("no error"), this.data);
    }


    public close(cb: (error: Error) => void): void {}
}

export default class SpiBusFactory {
    private constructor() {}
    
    public static create(device: string, test: boolean = false) {
        if (test) {
            return new SpiBus(device);
        }

        return SPI.initialize(device) as ISpiBus;
    }
}