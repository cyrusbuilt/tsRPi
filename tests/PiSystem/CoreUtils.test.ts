import CoreUtils from '../../src/lib/PiSystem/CoreUtils';

test("Can sleep millis", async () => {
    const start = new Date().getTime();
    console.log(`Timer start: ${start}`);

    await CoreUtils.delay(1000);

    const stop = new Date().getTime();
    console.log(`Timer stop: ${stop}`);

    expect(stop).toBeGreaterThan(start);
});

test("Can sleep micros", async () => {
    const start = new Date().getTime();
    console.log(`Timer start: ${start}`);

    await CoreUtils.sleepMicroseconds(200000);

    const stop = new Date().getTime();
    console.log(`Timer stop: ${stop}`);

    expect(stop).toBeGreaterThan(start);

    await CoreUtils.sleepMicroseconds(0); // For coverage.
});