class Enum {
    static of(name) {
        return new Enum(name);
    }
    constructor(name) {
        this._name = name;
        this._symbol = Symbol(name);
    }

    equals(other) {
        return other != null && this._symbol == other._symbol;
    }

    toString() {
        return `Enum(${this._name})`;
    }
}

class IntEnum extends Enum {
    constructor(val) {
        super(`int(${val})`);
        this.value = val;
    }

    get Value() { return this.value; }
}

export { Enum, IntEnum };