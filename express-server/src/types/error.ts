export class ErrorWithStatus extends Error {
    public status: number;

    public constructor(
        status: number,
        message: string,
    ) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
