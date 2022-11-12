/*
 * @version 0.0.1
 * @author Krishna Biradar [hello@krishnabiradar.com]
 * @license MIT
 */

import { createHmac } from 'crypto';
import { convertBase32ToBinary } from './base32';

type Algorithm = 'sha1' | 'sha256' | 'sha512';

/**
 *
 * @category Generate OTPs
 * @param secret The base32 secret.
 * @param counter The counter.
 * @param otpLength The length of the OTP. It must be between 6 and 9.
 * @param alg The hashing algorithm to be used with HMAC while generating the OTP.
 * @returns HOTP as string for the given counter and secret
 *
 */
export const generateHOTP = (
  secret: string,
  counter: number = 0,
  otpLength: number = 6,
  alg: Algorithm = 'sha1'
): string => {
  if (otpLength < 6 || otpLength > 9) {
    throw new RangeError('otpLength must be between 6 and 9');
  }

  const secretInBinary = convertBase32ToBinary(secret);

  const secretInFourBitChunks = [];
  for (let i = 0, len = secretInBinary.length; i < len; i += 4) {
    secretInFourBitChunks.push(secretInBinary.substr(i, 4));
  }

  const secretInHex = secretInFourBitChunks
    .map(chunk => {
      return parseInt(chunk, 2)
        .toString(16)
        .toUpperCase();
    })
    .join('');

  const counterInHex = counter.toString(16).padStart(16, '0');

  // Creates and returns an Hmac object that uses the given algorithm and key
  const hmac_result = createHmac(alg, Buffer.from(secretInHex, 'hex'))
    .update(Buffer.from(counterInHex, 'hex'))
    .digest('hex');

  const theNumber = parseInt(hmac_result[39], 16);

  const totp = parseInt(hmac_result.substr(theNumber * 2, 8), 16) & 0x7fffffff;

  return totp.toString().slice(-otpLength);
};

/**
 * Returns TOTP for the given counter
 *
 * @category Generate OTPs
 * @param secret The base32 secret.
 * @param timeStep The time step in seconds.
 * @param time Unix time in seconds.
 * @param otpLength The length of the OTP. It must be between 6 and 9.
 * @param alg The hashing algorithm to be used with HMAC while generating the OTP.
 * @returns TOTP as string for the given time step and secret
 *
 */
export const generateTOTP = (
  secret: string,
  timeStep: number = 60,
  time: number = Math.floor(Date.now() / 1000),
  otpLength: number = 6,
  alg: Algorithm = 'sha1'
): string => {
  return generateHOTP(secret, Math.floor(time / timeStep), otpLength, alg);
};

/**
 * Validates the given TOTP
 *
 * @category Validate OTPs
 * @param otp The OTP to be validated
 * @param secret The base32 secret.
 * @param timeStep The time step in seconds.
 * @param timeDrift Backward and forwards timeDrift in terms of timeStep.
 * @param time Unix time in seconds.
 * @param alg The hashing algorithm to be used with HMAC while generating the OTP.
 * @returns HOTP as string for the given counter and secret
 *
 */
export const validateTOTP = (
  otp: string,
  secret: string,
  timeStep: number = 60,
  time: number = Math.floor(Date.now() / 1000),
  timeDrift: [number, number] = [0,0],
  alg: Algorithm = 'sha1'
): boolean => {
  if (timeDrift[0] > timeDrift[1] || timeDrift[0] > 0 || timeDrift[1] < 0){
    throw new Error('Invalid Time drift values')
  }
  const validOtps = [];
  for (let i = -timeDrift[0]; i <= timeDrift[1]; i++) {
    validOtps.push(generateTOTP(secret, timeStep, time + (i*timeStep), otp.length, alg))
  }

  return validOtps.includes(otp);
};

/**
 * Validates the given HOTP
 *
 * @category Validate OTPs
 * @param otp The OTP to be validated.
 * @param secret The base32 secret.
 * @param counter The counter.
 * @param alg The hashing algorithm used with HMAC while generating the OTP.
 * @returns true if the HOTP is valid, else returns false.
 *
 */
export const validateHOTP = (
  otp: string,
  secret: string,
  counter: number,
  alg: Algorithm = 'sha1'
): boolean => {
  return otp === generateHOTP(secret, counter, otp.length, alg);
};
