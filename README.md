# CRYPTO-GOAT
## _Javascript Cryptography library_

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

crypto-goat is a simple, optimized, not super secure, npm cryptography module.

## Features

- Encryption and Decryption
- Message Encoding
- ✨Optimizations✨

## Installation

crypto-goat requires [Node.js](https://nodejs.org/) to run.

Install the module and Dependencies to use the library.

```sh
cd your-directory
npm I crypto-goat
```

## Development

How can I use this library??

Importing in the project:
```sh
const cryptoGoat = require('crypto-goat')
```

Keys generation:

```sh
let keys = generateKeyPair(p, q);
```
The function returns an array containing PublicKey and PrivateKey, both will be generated based on the same parameters `P` and `Q`, for P is recommended a small prime number, for the Q is recommended a big prime number with at least 6 digits (it won't work with less than 6 digits)

Encrypting a message:

```sh
let publicKey = keys[0];
let encrypted = publicKey.Encrypt('Hiii :)')
```
`encrypted` is going to be a `Message` object containing DF (Division Factors) array and a Message array

Decrypting a message:

```sh
let privateKey = keys[1];
let decrypted = privateKey.Decrypt(encrypted)
```
`decrypted` is going to be a `Message` object containing only a Message array

## How it Works
crypto-goat is an `RSA` algorithm implementation. Since the algorithm uses an exponentiation operator at a certain point I had to optimize many things to get the module to work fast.
First of all since after the exponentiation there was a modulo operator I converted the project to use `bigInt` library which contains a function called 'modPow' that optimizes the process.
Since the algorithm needs integers I had to find a way to encode string messages to integer numbers, by doing that I inevitably stumble across the problem that with big string a big integer would get encoded and the algorithm would be slow, so I decided to do two things:
- Divide the numbers by the biggest division factor available and store that factor in the message object sent across to be decrypted, for security reasons I decided to encrypt these values too.
- Separate the text in multiple chunks of variable size and store them as an array with a single division factor for all of them. The message object is then going to be a collection of two smaller arrays: the message array containing the reduced version of the encrypted message and the division factors array that contains the factors to make the message array decryptable, this adds a little computation to add but a great comeback in performance.

The project is open source and if you have some optimizations to do feel free to propose changes to the directory.

## License

MIT

**WARNING: this library is done for educational purposes only and it's still in development, I don't recommend using it in serious projects**

