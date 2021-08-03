/* eslint-disable no-shadow,no-param-reassign */
// @ts-nocheck
import {
  blob,
  Layout as LayoutCls,
  offset,
  seq,
  struct,
  u32,
  u8,
  union,
} from 'buffer-layout';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export {
  u8,
  s8 as i8,
  u16,
  s16 as i16,
  u32,
  s32 as i32,
  struct,
} from 'buffer-layout';
class BNLayout extends LayoutCls {
  constructor(span, signed, property) {
    super(span, property);
    this.blob = blob(span);
    this.signed = signed;
  }

  decode(b, offset = 0) {
    const num = new BN(this.blob.decode(b, offset), 10, 'le');
    if (this.signed) {
      return num.fromTwos(this.span * 8).clone();
    }
    return num;
  }

  encode(src, b, offset = 0) {
    if (this.signed) {
      src = src.toTwos(this.span * 8);
    }
    return this.blob.encode(
      src.toArrayLike(Buffer, 'le', this.span),
      b,
      offset,
    );
  }
}
export function u64(property) {
  return new BNLayout(8, false, property);
}
export function i64(property) {
  return new BNLayout(8, true, property);
}
export function u128(property) {
  return new BNLayout(16, false, property);
}
export function i128(property) {
  return new BNLayout(16, true, property);
}
class WrappedLayout extends LayoutCls {
  constructor(layout, decoder, encoder, property) {
    super(layout.span, property);
    this.layout = layout;
    this.decoder = decoder;
    this.encoder = encoder;
  }

  decode(b, offset) {
    return this.decoder(this.layout.decode(b, offset));
  }

  encode(src, b, offset) {
    return this.layout.encode(this.encoder(src), b, offset);
  }

  getSpan(b, offset) {
    return this.layout.getSpan(b, offset);
  }
}
export function publicKey(property) {
  return new WrappedLayout(
    blob(32),
    (b) => new PublicKey(b),
    (key) => key.toBuffer(),
    property,
  );
}
class OptionLayout extends LayoutCls {
  constructor(layout, property) {
    super(-1, property);
    this.layout = layout;
    this.discriminator = u8();
  }

  encode(src, b, offset = 0) {
    if (src === null || src === undefined) {
      return this.discriminator.encode(0, b, offset);
    }
    this.discriminator.encode(1, b, offset);
    return this.layout.encode(src, b, offset + 1) + 1;
  }

  decode(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return null;
    } else if (discriminator === 1) {
      return this.layout.decode(b, offset + 1);
    }
    throw new Error(`Invalid option ${this.property}`);
  }

  getSpan(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return 1;
    } else if (discriminator === 1) {
      return this.layout.getSpan(b, offset + 1) + 1;
    }
    throw new Error(`Invalid option ${this.property}`);
  }
}
export function option(layout, property) {
  return new OptionLayout(layout, property);
}
export function bool(property) {
  return new WrappedLayout(u8(), decodeBool, encodeBool, property);
}
function decodeBool(value) {
  if (value === 0) {
    return false;
  } else if (value === 1) {
    return true;
  }
  throw new Error(`Invalid bool: ${value}`);
}
function encodeBool(value) {
  return value ? 1 : 0;
}
export function vec(elementLayout, property) {
  const length = u32('length');
  const layout = struct([
    length,
    seq(elementLayout, offset(length, -length.span), 'values'),
  ]);
  return new WrappedLayout(
    layout,
    ({ values }) => values,
    (values) => ({ values }),
    property,
  );
}
export function tagged(tag, layout, property) {
  const wrappedLayout = struct([u64('tag'), layout.replicate('data')]);
  function decodeTag({ tag: receivedTag, data }) {
    if (!receivedTag.eq(tag)) {
      throw new Error(
        `Invalid tag, expected: ${tag.toString(
          'hex',
        )}, got: ${receivedTag.toString('hex')}`,
      );
    }
    return data;
  }
  return new WrappedLayout(
    wrappedLayout,
    decodeTag,
    (data) => ({ tag, data }),
    property,
  );
}
export function vecU8(property) {
  const length = u32('length');
  const layout = struct([length, blob(offset(length, -length.span), 'data')]);
  return new WrappedLayout(
    layout,
    ({ data }) => data,
    (data) => ({ data }),
    property,
  );
}
export function str(property) {
  return new WrappedLayout(
    vecU8(),
    (data) => data.toString('utf-8'),
    (s) => Buffer.from(s, 'utf-8'),
    property,
  );
}
export function rustEnum(variants, property) {
  const unionLayout = union(u8(), property);
  variants.forEach((variant, index) =>
    unionLayout.addVariant(index, variant, variant.property),
  );
  return unionLayout;
}
export function array(elementLayout, length, property) {
  const layout = struct([seq(elementLayout, length, 'values')]);
  return new WrappedLayout(
    layout,
    ({ values }) => values,
    (values) => ({ values }),
    property,
  );
}
