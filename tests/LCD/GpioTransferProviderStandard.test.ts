import * as FS from 'fs';
import { mocked } from 'ts-jest/utils';
import ExecUtils from '../../src/lib/ExecUtils';
import GpioTransferProviderStandard from '../../src/lib/LCD/GpioTransferProviderStandard';
import IllegalArgumentException from '../../src/lib/IllegalArgumentException';
import ObjectDisposedException from '../../src/lib/ObjectDisposedException';
import { GpioPins, PinState } from '../../src/lib/IO';

jest.mock('fs');
jest.mock('../../src/lib/ExecUtils');

const result: string[] = [];
const mockedExecUtils = mocked(ExecUtils, true);
mockedExecUtils.executeCommand.mockReturnValue(Promise.resolve(result));

const mockedFS = mocked(FS, true);
mockedFS.existsSync.mockReturnValue(false);
mockedFS.writeFileSync.mockReturnValue();

test("Can construct and destruct, throws exception on GPIO_NONE", async () => {
    let provider = new GpioTransferProviderStandard(
        GpioPins.GPIO07,
        GpioPins.GPIO08,
        GpioPins.GPIO09,
        GpioPins.GPIO10,
        GpioPins.GPIO11,
        GpioPins.GPIO14,
        GpioPins.GPIO15,
        GpioPins.GPIO17,
        true,
        GpioPins.GPIO18,
        GpioPins.GPIO21,
        GpioPins.GPIO22
    );

    expect(provider.isDisposed).toBeFalsy();
    expect(provider.isFourBitMode).toBeTruthy();

    await provider.dispose();
    expect(provider.isDisposed).toBeTruthy();
    await provider.dispose();  // Again for coverage.

    // Try with invalid RS pin.
    let err = new IllegalArgumentException("'rs' param must be a GpioPins member " + 'other than GpioPins.GPIO_NONE.');
    expect(() =>
        provider = new GpioTransferProviderStandard(
            GpioPins.GPIO07,
            GpioPins.GPIO08,
            GpioPins.GPIO09,
            GpioPins.GPIO10,
            GpioPins.GPIO11,
            GpioPins.GPIO14,
            GpioPins.GPIO15,
            GpioPins.GPIO17,
            true,
            GpioPins.GPIO_NONE,
            GpioPins.GPIO21,
            GpioPins.GPIO22
        )
    ).toThrow(err);

    await provider.dispose();

    // Try again with invalid enable pin
    err = new IllegalArgumentException(
        "'enable' param must be a GpioPins member " + 'other than GpioPins.GPIO_NONE.',
    );
    expect(() =>
        provider = new GpioTransferProviderStandard(
            GpioPins.GPIO07,
            GpioPins.GPIO08,
            GpioPins.GPIO09,
            GpioPins.GPIO10,
            GpioPins.GPIO11,
            GpioPins.GPIO14,
            GpioPins.GPIO15,
            GpioPins.GPIO17,
            true,
            GpioPins.GPIO18,
            GpioPins.GPIO_NONE,
            GpioPins.GPIO22
        )
    ).toThrow(err);

    await provider.dispose();
});

test("Can begin", async () => {
    const provider = new GpioTransferProviderStandard(
        GpioPins.GPIO07,
        GpioPins.GPIO08,
        GpioPins.GPIO09,
        GpioPins.GPIO10,
        GpioPins.GPIO11,
        GpioPins.GPIO14,
        GpioPins.GPIO15,
        GpioPins.GPIO17,
        true,
        GpioPins.GPIO18,
        GpioPins.GPIO21,
        GpioPins.GPIO22
    );

    await provider.begin();
    
    await provider.dispose();
    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(provider.begin()).rejects.toThrow(err);
});

test("Can send data", async () => {
    let provider = new GpioTransferProviderStandard(
        GpioPins.GPIO07,
        GpioPins.GPIO08,
        GpioPins.GPIO09,
        GpioPins.GPIO10,
        GpioPins.GPIO11,
        GpioPins.GPIO14,
        GpioPins.GPIO15,
        GpioPins.GPIO17,
        true,
        GpioPins.GPIO18,
        GpioPins.GPIO21,
        GpioPins.GPIO22
    );

    await provider.begin();

    // Try in 4-bit mode.
    await provider.send(1, PinState.HIGH, true);
    await provider.dispose();

    const err = new ObjectDisposedException('GpioTransferProviderStandard');
    await expect(provider.send(1, PinState.HIGH, true)).rejects.toThrow(err);

    provider = new GpioTransferProviderStandard(
        GpioPins.GPIO07,
        GpioPins.GPIO08,
        GpioPins.GPIO09,
        GpioPins.GPIO10,
        GpioPins.GPIO11,
        GpioPins.GPIO14,
        GpioPins.GPIO15,
        GpioPins.GPIO17,
        false,
        GpioPins.GPIO18,
        GpioPins.GPIO21,
        GpioPins.GPIO22
    );

    await provider.begin();

    // Try again in 8-bit mode.
    await provider.send(1, PinState.HIGH, true);

    await provider.dispose();
    await expect(provider.send(1, PinState.HIGH, true)).rejects.toThrow(err);
});