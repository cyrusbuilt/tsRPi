import { BoardRevision } from '../../BoardRevision';
import ObjectDisposedException from '../../ObjectDisposedException';
import * as I2CNativeMock from './I2cMock';
import II2C from './II2C';

class I2CBusMock implements II2C {
	private busId: number;
  	private objDisposed: boolean;
  	private busOpen: boolean;
  	private bus: I2CNativeMock.I2cBus | null;

	constructor(boardRev: BoardRevision = BoardRevision.Rev1) {
		this.busId = 1;
		if (boardRev === BoardRevision.Rev1) {
		  this.busId = 0;
		}
	
		this.objDisposed = false;
		this.busOpen = false;
		this.bus = null;
	}

	public get isDisposed() {
		return this.objDisposed;
	}

	public get isOpen() {
		return this.busOpen;
	}

	public async open() {
		this.bus = I2CNativeMock.openSync(this.busId);
		this.busOpen = true;
	}

	public async close() {
		this.busOpen = false;
	}

	public async dispose() {
		await this.close();
    	this.bus = null;
    	this.objDisposed = true;
	}

	public async writeBytes(address: number, buffer: Buffer) {
		if (this.isDisposed || this.bus === null) {
			throw new ObjectDisposedException('I2CBus');
		}
		this.bus.i2cWriteSync(address, buffer.length, buffer);
	}

	public async writeByte(address: number, byte: number) {
		const bytes = new Array<number>(1);
		bytes[0] = byte;
		return this.writeBytes(address, Buffer.from(bytes));
	}

	public async writeCommand(address: number, command: number, data1?: number, data2?: number) {
		let bytes = new Array<number>(1);
		bytes[0] = command;
	
		if (!!data1) {
		  bytes = new Array<number>(2);
		  bytes[0] = command;
		  bytes[1] = data1;
		}
	
		if (!!data2) {
		  bytes = new Array<number>(2);
		  bytes[0] = command;
		  bytes[1] = data2;
		}
	
		if (!!data1 && !!data2) {
		  bytes = new Array<number>(3);
		  bytes[0] = command;
		  bytes[1] = data1;
		  bytes[2] = data2;
		}
	
		return this.writeBytes(address, Buffer.from(bytes));
	}

	public async writeCommandByte(address: number, command: number, data: number) {
		const bytes = new Array<number>(3);
		bytes[0] = command;
		bytes[1] = data && 0xff;
		bytes[2] = data >> 8;
		return this.writeBytes(address, Buffer.from(bytes));
	}

	public async readBytes(address: number, count: number) {
		if (this.isDisposed || !!!this.bus) {
			throw new ObjectDisposedException('I2CBus');
		}

		const buffer = new Array<number>(count);
    	const result = Buffer.from(buffer);
		this.bus.i2cReadSync(address, buffer.length, result);
		return result;
	}

	public async read(address: number) {
		const result = await this.readBytes(address, 1);
		return result[0];
	}
}

export const BusMock = new I2CBusMock(BoardRevision.Rev2);