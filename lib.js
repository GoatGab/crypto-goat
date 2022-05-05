const bigInt = require('big-integer')

function gcd(k, n) {
    return k ? gcd(n % k, k) : n;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function encode(str) {
    const codes = str
        .split('')
        .map(i => i.charCodeAt())
        .join('');

    return Number(codes);
}

function decode(code) {
    const stringified = code.toString();
    let string = '';

    for (let i = 0; i < stringified.length; i += 2) {
        let num = Number(stringified.substr(i, 2));

        if (num <= 30) {
            string += String.fromCharCode(Number(stringified.substr(i, 3)));
            i++;
        } else {
            string += String.fromCharCode(num);
        }
    }

    return string;
}

exports.PublicKey = class {
    constructor(p, q) {
        this.p = p;
        this.q = q;
        this.m;
        this.a;
        this.initialize();
    }

    initialize() {
        this.m = this.p * this.q;
        this.a = this.generateA();
    }

    generateCoprimesAmount() {
        return (this.p - 1) * (this.q - 1);
    }

    generateA() {
        for (let i = 2; i < this.generateCoprimesAmount(); i++) {
            if (gcd(this.m, i) == 1 && gcd(this.generateCoprimesAmount(), i) == 1) {
                return i;
            }
        }
    }

    EncryptDF(df) {
        let out = [];
        for (let i = 0; i < df.length; i++) {
            out.push(bigInt(df[i]).modPow(bigInt(this.a), bigInt(this.m)))
        }
        return out;
    }

    Encrypt(message) {
        message = EncodeMessage(message, 2);
        let DF = [];
        for (let i = 0; i < message.length; i++) {
            DF.push(getGreaterDivisor(message[i]))
            message[i] /= DF[i];
        }
        let closerPrime = getCloserPrime(max(message) + 1);
        // if (this.q < closerPrime) {
        //     this.q = closerPrime;
        //     this.initialize();
        // }
        if (message instanceof Array) {
            for (let i = 0; i < message.length; i++) {
                message[i] = bigInt(message[i]).modPow(bigInt(this.a), bigInt(this.m));
            }
            return new exports.Message(message, this.EncryptDF(DF));
        } else {
            return new exports.Message(bigInt(message).modPow(bigInt(this.a), bigInt(this.m)), DF[0]);
        }
    }
}

exports.PrivateKey = class {
    constructor(p, q, publicKey) {
        this.p = p;
        this.q = q;
        this.m;
        this.publicKey = publicKey;
        this.a;
        this.initialize()
    }

    initialize() {
        this.m = this.p * this.q;
        this.a = this.generateA();
    }

    generateCoprimesAmount() {
        return (this.p - 1) * (this.q - 1);
    }

    generateA() {
        let phi = this.generateCoprimesAmount();
        let candidates = [];
        for (let i = 0; i < this.publicKey.a * phi; i++) {
            if ((this.publicKey.a * i) % phi == 1) {
                candidates.push(i);
                break;
            }
        }
        return candidates[0];
    }

    Decrypt(message, DF) {
        // if (this.publicKey.q != this.q) {
        //     this.q = this.publicKey.q;
        //     this.initialize();
        // }
        if (message instanceof Array) {
            for (let i = 0; i < message.length; i++) {
                message[i] = bigInt(message[i]).modPow(bigInt(this.a), bigInt(this.m));
            }
            return new exports.Message(DecodeMessage(message, DF).join(''));
        } else {
            return new exports.Message(bigInt(message).modPow(bigInt(this.a), bigInt(this.m)));
        }
    }

    DecryptDF(df) {
        let out = [];
        for (let i = 0; i < df.length; i++) {
            out.push(bigInt(df[i]).modPow(bigInt(this.a), bigInt(this.m)))
        }
        return out;
    }

    Decrypt(m) {
        // if (this.publicKey.q != this.q) {
        //     this.q = this.publicKey.q;
        //     this.initialize();
        // }
        if (m.message instanceof Array) {
            for (let i = 0; i < m.message.length; i++) {
                m.message[i] = bigInt(m.message[i]).modPow(bigInt(this.a), bigInt(this.m));
            }
            return new exports.Message(DecodeMessage(m.message, this.DecryptDF(m.DF)).join(''));
        } else {
            return new exports.Message(bigInt(m.message).modPow(bigInt(this.a), bigInt(this.m)));
        }
    }
}

exports.Message = class {
    constructor(message, DF = null) {
        this.message = message;
        this.DF = DF;
    }
}

function Encrypt(key, content) {
    if (content instanceof Array) {
        for (let i = 0; i < content.length; i++) {
            content[i] = bigInt(content[i]).modPow(bigInt(key.a), bigInt(key.m));
        }
        return content;
    } else {
        return bigInt(content).modPow(bigInt(key.a), bigInt(key.m));
    }
}

function max(arr) {
    let currentMax = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > currentMax) {
            currentMax = arr[i];
        }
    }
    return currentMax;
}

function Decrypt(key, content) {
    if (content instanceof Array) {
        for (let i = 0; i < content.length; i++) {
            content[i] = bigInt(content[i]).modPow(bigInt(key.a), bigInt(key.m));
        }
        return content;
    } else {
        return bigInt(content).modPow(bigInt(key.a), bigInt(key.m));
    }
}

function getGreaterDivisor(n) {
    for (let i = Math.floor(n / 2); i > 0; i--) {
        if (n % i == 0) {
            return i;
        }
    }
    return 1;
}

function isPrime(n) {
    if (n == 1) {
        return false;
    }
    for (let i = 2; i < n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

function getCloserPrime(n) {
    for (let i = n + 1;; i++) {
        if (isPrime(i)) {
            return i;
        }
    }
}

function EncodeMessage(m, cs) {
    let chunkSize = cs;
    let chunks = chunkString(m, chunkSize);
    for (let i = 0; i < chunks.length; i++) {
        chunks[i] = encode(chunks[i]);
    }
    return chunks;
}

function DecodeMessage(m, DF) {
    let chunks = m;
    for (let i = 0; i < chunks.length; i++) {
        chunks[i] = decode(chunks[i] * DF[i]);
    }
    return chunks;
}

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
}

function chunkInteger(n, length) {
    str = n.toString();
    str = str.match(new RegExp('.{1,' + length + '}', 'g'));
    for (let i = 0; i < str.length; i++) {
        str[i] = Number(str[i]);
    }
    return str;
}

exports.generateKeyPair = function(p, q) {
    let puk = new exports.PublicKey(p, q);
    let prk = new exports.PrivateKey(p, q, puk);
    return [puk, prk];
}