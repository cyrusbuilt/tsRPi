import * as Converter from 'convert-string';
import * as Util from 'util';
import IDisposable from "../IDisposable";
import ILcdTransferProvider from "./ILcdTransferProvider";
import { PinState } from "../IO";
import { LcdCommands } from "./LcdCommands";
import { DisplayOnOffControl } from "./DisplayOnOffControl";
import Coreutils from '../PiSystem/CoreUtils';
import { FunctionSetFlags } from './FunctionSetFlags';
import { DisplayEntryModes } from './DisplayEntryModes';
import ObjectDisposedException from '../ObjectDisposedException';

export default class LcdModule implements IDisposable {
    private objDisposed: boolean;
    private xferProvider: ILcdTransferProvider;
    private backlight: boolean;
    private isVisible: boolean;
    private doesShowCursor: boolean;
    private doesBlinkCursor: boolean;
    private ready: boolean;
    private sendQueue: number[];
    private displayFunction: number;
    private numLines: number;
    private numColumns: number;
    private readonly rowOffsets: number[];

    constructor(provider: ILcdTransferProvider) {
        this.xferProvider = provider;
        this.numLines = 0;
        this.numColumns = 0;
        this.objDisposed = false;
        this.rowOffsets = [0x00, 0x40, 0x14, 0x54];
        this.backlight = true;
        this.isVisible = true;
        this.doesShowCursor = true;
        this.doesBlinkCursor = true;
        this.ready = false;
        this.sendQueue = [];
        this.displayFunction = 0;
        if (this.provider.isFourBitMode) {
            this.displayFunction = FunctionSetFlags.FOUR_BIT_MODE |
                                    FunctionSetFlags.ONE_LINE |
                                    FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
        }
        else {
            this.displayFunction = FunctionSetFlags.EIGHT_BIT_MODE |
                                    FunctionSetFlags.ONE_LINE |
                                    FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
        }
    }

    public get isDisposed() {
        return this.objDisposed;
    }

    public get provider() {
        return this.xferProvider;
    }

    public get showCursor() {
        return this.doesShowCursor;
    }

    public get rows() {
        return this.numLines;
    }

    public get columns() {
        return this.numColumns;
    }

    public set showCursor(value: boolean) {
        if (this.doesShowCursor !== value) {
            this.doesShowCursor = value;
            this.updateDisplayControl();
        }
    }

    public get blinkCursor() {
        return this.doesBlinkCursor;
    }

    public set blinkCursor(value: boolean) {
        if (this.doesBlinkCursor !== value) {
            this.doesBlinkCursor = value;
            this.updateDisplayControl();
        }
    }

    public get visible() {
        return this.isVisible;
    }

    public set visible(value: boolean) {
        if (this.isVisible !== value) {
            this.isVisible = value;
            this.updateDisplayControl();
        }
    }

    public get backlightEnabled() {
        return this.backlight;
    }

    public set backlightEnabled(value: boolean) {
        if (this.backlight !== value) {
            this.backlight = value;
            this.updateDisplayControl();
        }
    }

    public async sendCommand(data: number) {
        return this.xferProvider.send(data, PinState.LOW, this.backlight);
    }

    public async writeByte(data: number) {
        return this.xferProvider.send(data, PinState.HIGH, this.backlight);
    }

    public async createChar(location: number, charmap: number[], offset: number = 0) {
        location &= 0x07;  // We only have 8 locations (0 - 7).
        await this.sendCommand(LcdCommands.SET_CG_RAM_ADDR | (location << 3));
        for (let i = 0; i < 8; i++) {
            await this.writeByte(charmap[offset + i]);
        }
    }

    public async write(buffer: Buffer, offset: number, count: number) {
        const len = (offset + count);
        for (let i = offset; i < len; i++) {
            await this.writeByte(buffer[i]);
        }
    }

    public async writeString(str: string) {
        const buffer = Buffer.from(Converter.convertString.UTF8.stringToBytes(str));
        return this.write(buffer, 0, buffer.length);
    }

    public async moveCursor(right: boolean) {
        return this.sendCommand(0x10 | (right ? 0x04 : 0x00));
    }

    public async scrollDisplayRight() {
        return this.sendCommand(0x18 | 0x04);
    }

    public async scrollDisplayLeft() {
        return this.sendCommand(0x18 | 0x00);
    }

    public async setCursorPosition(column: number, row: number) {
        if (row > this.rows) {
            row = this.rows - 1;
        }

        const address = (column + this.rowOffsets[row]);
        return this.sendCommand(LcdCommands.SET_DD_RAM_ADDR | address);
    }

    public async returnHome() {
        await this.sendCommand(LcdCommands.RETURN_HOME);
        await Coreutils.sleepMicroseconds(2000);
    }

    public async clear() {
        await this.sendCommand(LcdCommands.CLEAR_DISPLAY);
        await Coreutils.sleepMicroseconds(2000);
    }

    public async begin(columns: number, lines: number, leftToRight: boolean = true, dotSize: boolean = false) {
        if (this.isDisposed) {
            throw new ObjectDisposedException("LcdModule");
        }

        if (lines > 1) {
            this.displayFunction |= FunctionSetFlags.TWO_LINE;
        }

        this.numLines = lines;
        this.numColumns = columns;

        // For some 1 line displays, you can select 10 pixel high font.
        if (dotSize && lines === 1) {
            this.displayFunction |= FunctionSetFlags.FIVE_BY_EIGHT_DOTS;
        }

        // LCD controller needs time to warm-up.
        await this.enqueueCommand(-1, 50);

        // rs, rw, and enable should be low by default.
        if (this.provider.isFourBitMode) {
            // This is according to the Hitachi HD44780 datasheet.
            // figure 24, pg 46.

            // We start in 8-bit mode, try to set to 4-bit mode.
            await this.sendCommand(0x03);
            await this.enqueueCommand(0x03, 5);  // Wait minimum 4.1ms
            await this.enqueueCommand(0x03, 5);
            await this.enqueueCommand(0x02, 5);  // Finally, set to 4-bit interface.
        }
        else {
            // This is according to the Hitachi HD44780 datasheet
            // page 45, figure 23.

            // Send function set command sequence.
            await this.sendCommand(LcdCommands.FUNCTION_SET | this.displayFunction);
            await this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction, 5);
            await this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction, 5);
        }

        // Finally, set # of lines, font size, etc.
        await this.enqueueCommand(LcdCommands.FUNCTION_SET | this.displayFunction, 0);

        // Turn the display on with no cursor or blinking default.
        this.isVisible = true;
        this.doesShowCursor = false;
        this.doesBlinkCursor = false;
        this.backlight = true;
        await this.updateDisplayControl();

        // Clear it off.
        await this.clear();

        // Set the entry mode.
        let displayMode = leftToRight ? DisplayEntryModes.ENTRY_LEFT : DisplayEntryModes.ENTRY_RIGHT;
        displayMode |= DisplayEntryModes.ENTRY_SHIFT_DECREMENT;
        return this.sendCommand(LcdCommands.ENTRY_MODE_SET | displayMode);
    }

    public async dispose() {
        if (this.isDisposed) {
            return;
        }

        await this.provider.dispose();
        this.sendQueue = [];
        this.isVisible = false;
        this.doesBlinkCursor = false;
        this.numColumns = 0;
        this.numLines = 0;
        this.objDisposed = true;
    }

    private async updateDisplayControl() {
        let command = LcdCommands.DISPLAY_CONTROL;
        command |= this.isVisible ? DisplayOnOffControl.DISPLAY_ON : DisplayOnOffControl.DISPLAY_OFF;
        command |= this.doesShowCursor ? DisplayOnOffControl.CURSOR_ON : DisplayOnOffControl.CURSOR_OFF;
        command |= this.doesBlinkCursor ? DisplayOnOffControl.BLINK_ON : DisplayOnOffControl.BLINK_OFF;

        // NOTE: Backlight is updated with each command.
        return this.sendCommand(command);
    }

    private async processSendQueue(timeout: number) {
        if (!this.ready || this.sendQueue.length === 0) {
            return;
        }

        this.ready = false;
        if (timeout < 0) {
            timeout = 0;
        }

        let cmd = this.sendQueue.shift();
        if (!Util.isNullOrUndefined(cmd) && cmd !== -1) {
            await this.sendCommand(cmd);
        }

        const self = this;
        setTimeout(() => {
            self.ready = true;
            self.processSendQueue(timeout);
        }, timeout);
    }

    private async enqueueCommand(cmd: number, timeout: number) {
        this.sendQueue.push(cmd);
        return this.processSendQueue(timeout);
    }
}