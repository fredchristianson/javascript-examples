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

    get Value() { return this._name; }

    compare(other) {
        if (other == null) { return -1; }
        if (!(other instanceof Enum)) {
            return -1;
        }
        return this._name.localeCompare(other._name);
    }
}

class IntEnum extends Enum {
    static of(val = 0) {
        return new IntEnum(val);
    }

    constructor(val) {
        super(`int(${val})`);
        this._value = val;
    }

    get Value() { return this._value; }

    compare(other) {
        if (other == null) { return -1; }
        if (!(other instanceof Enum)) {
            return -1;
        }
        return this._value - other._value;
    }
}

export { Enum, IntEnum };