import {IBls} from "./interface";
import {validateBytes} from "./helpers";
import {NotInitializedError} from "./errors";

// Returned type is enforced at each implementation's index
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function functionalInterfaceFactory({
  SecretKey,
  PublicKey,
  Signature,
}: Pick<IBls, "SecretKey" | "PublicKey" | "Signature">) {
  /**
   * Signs given message using secret key.
   * @param secretKey
   * @param message
   */
  function sign(secretKey: Uint8Array, message: Uint8Array): Uint8Array {
    validateBytes(secretKey, "secretKey");
    validateBytes(message, "message");

    return SecretKey.fromBytes(secretKey).sign(message).toBytes();
  }

  /**
   * Compines all given signature into one.
   * @param signatures
   */
  function aggregateSignatures(signatures: Uint8Array[]): Uint8Array {
    const agg = Signature.aggregate(signatures.map((p) => Signature.fromBytes(p)));
    return agg.toBytes();
  }

  /**
   * Combines all given public keys into single one
   * @param publicKeys
   */
  function aggregatePublicKeys(publicKeys: Uint8Array[]): Uint8Array {
    const agg = PublicKey.aggregate(publicKeys.map((p) => PublicKey.fromBytes(p)));
    return agg.toBytes();
  }

  /**
   * Verifies if signature is message signed with given public key.
   * @param publicKey
   * @param message
   * @param signature
   */
  function verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
    validateBytes(publicKey, "publicKey");
    validateBytes(message, "message");
    validateBytes(signature, "signature");

    try {
      return Signature.fromBytes(signature).verify(PublicKey.fromBytes(publicKey), message);
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if aggregated signature is same message signed with given public keys.
   * @param publicKeys
   * @param message
   * @param signature
   */
  function verifyAggregate(publicKeys: Uint8Array[], message: Uint8Array, signature: Uint8Array): boolean {
    validateBytes(publicKeys, "publicKey");
    validateBytes(message, "message");
    validateBytes(signature, "signature");

    try {
      return Signature.fromBytes(signature).verifyAggregate(
        publicKeys.map((publicKey) => PublicKey.fromBytes(publicKey)),
        message
      );
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Verifies if signature is list of message signed with corresponding public key.
   * @param publicKeys
   * @param messages
   * @param signature
   * @param fast Check if all messages are different
   */
  function verifyMultiple(publicKeys: Uint8Array[], messages: Uint8Array[], signature: Uint8Array): boolean {
    validateBytes(publicKeys, "publicKey");
    validateBytes(messages, "message");
    validateBytes(signature, "signature");

    if (publicKeys.length === 0 || publicKeys.length != messages.length) {
      return false;
    }
    try {
      return Signature.fromBytes(signature).verifyMultiple(
        publicKeys.map((publicKey) => PublicKey.fromBytes(publicKey)),
        messages.map((msg) => msg)
      );
    } catch (e) {
      if (e instanceof NotInitializedError) throw e;
      return false;
    }
  }

  /**
   * Computes a public key from a secret key
   */
  function secretKeyToPublicKey(secretKey: Uint8Array): Uint8Array {
    validateBytes(secretKey, "secretKey");
    return SecretKey.fromBytes(secretKey).toPublicKey().toBytes();
  }

  return {
    sign,
    aggregateSignatures,
    aggregatePublicKeys,
    verify,
    verifyAggregate,
    verifyMultiple,
    secretKeyToPublicKey,
  };
}
