/* @flow strict */
/* eslint-disable no-use-before-define */

import { GraphQLObjectType, GraphQLInputObjectType, getNamedType } from '../graphql';
import type { GraphQLInputType, GraphQLOutputType } from '../graphql';
import { deprecate } from './debug';
import { TypeComposer } from '../TypeComposer';
import { InputTypeComposer } from '../InputTypeComposer';
import { InterfaceTypeComposer } from '../InterfaceTypeComposer';
import { UnionTypeComposer } from '../UnionTypeComposer';
import { Resolver } from '../Resolver';
import type { SchemaComposer } from '../SchemaComposer';

/**
 * fieldName
 * @argName
 * #resolver
 */
export function typeByPath(
  src:
    | TypeComposer<any>
    | InputTypeComposer
    | Resolver<any, any>
    | InterfaceTypeComposer<any>
    | UnionTypeComposer<any>,
  path: string | Array<string>
) {
  const parts = Array.isArray(path) ? path : String(path).split('.');

  if (parts.length === 0) {
    return src;
  }

  if (src instanceof TypeComposer) {
    return typeByPathTC(src, parts);
  } else if (src instanceof InputTypeComposer) {
    return typeByPathITC(src, parts);
  } else if (src instanceof Resolver) {
    return typeByPathRSV(src, parts);
  } else if (src instanceof InterfaceTypeComposer) {
    return typeByPathIFTC(src, parts);
  }

  return src;
}

export function typeByPathTC(tc: TypeComposer<any>, parts: Array<string>) {
  if (!tc) return undefined;
  if (parts.length === 0) return tc;

  const name = parts[0];
  if (!name) return undefined;
  const nextName = parts[1];

  if (name.startsWith('$')) {
    const restParts = parts.slice(1);
    const resolver = tc.getResolver(name.substring(1));
    if (resolver) {
      if (restParts.length > 0) {
        return typeByPathRSV(resolver, restParts);
      }
      return resolver;
    }
    return undefined;
  }

  if (nextName && nextName.startsWith('@')) {
    const argType = tc.getFieldArgType(name, nextName.substring(1));
    return processType(argType, parts.slice(2), tc.constructor.schemaComposer);
  }

  const fieldType = tc.getFieldType(name);
  return processType(fieldType, parts.slice(1), tc.constructor.schemaComposer);
}

export function typeByPathITC(itc: InputTypeComposer, parts: Array<string>) {
  if (!itc) return undefined;
  if (parts.length === 0) return itc;

  const fieldType = itc.getFieldType(parts[0]);
  return processType(fieldType, parts.slice(1), itc.constructor.schemaComposer);
}

function typeByPathRSV(rsv: Resolver<any, any>, parts: Array<string>) {
  if (!rsv) return undefined;
  if (parts.length === 0) return rsv;
  const name = parts[0];
  if (!name) return undefined;

  if (name.startsWith('@')) {
    const argName = name.substring(1);
    const arg = rsv.getArg(argName);
    if (!arg) return undefined;
    return processType(rsv.getArgType(argName), parts.slice(1), rsv.constructor.schemaComposer);
  }

  return processType(rsv.getType(), parts, rsv.constructor.schemaComposer);
}

/** @deprecated 6.0.0 */
export function typeByPathFTC(tc: InterfaceTypeComposer<any>, parts: Array<string>) {
  deprecate('Use `typeByPathIFTC()` method instead');
  return typeByPathIFTC(tc, parts);
}

export function typeByPathIFTC(tc: InterfaceTypeComposer<any>, parts: Array<string>) {
  if (!tc) return undefined;
  if (parts.length === 0) return tc;

  const name = parts[0];
  if (!name) return undefined;
  const nextName = parts[1];

  if (name.startsWith('$')) {
    // Interface does not have resolvers
    return undefined;
  }

  if (nextName && nextName.startsWith('@')) {
    const argType = tc.getFieldArgType(name, nextName.substring(1));
    return processType(argType, parts.slice(2), tc.constructor.schemaComposer);
  }

  const fieldType = tc.getFieldType(name);
  return processType(fieldType, parts.slice(1), tc.constructor.schemaComposer);
}

export function processType(
  type: GraphQLOutputType | GraphQLInputType | void | null,
  restParts: Array<string>,
  schema: SchemaComposer<any>
): mixed {
  if (!type) return undefined;
  const unwrappedType = getNamedType(type);

  if (unwrappedType instanceof GraphQLObjectType) {
    const tc = new schema.TypeComposer(unwrappedType);
    if (restParts.length > 0) {
      return typeByPathTC(tc, restParts);
    }
    return tc;
  } else if (unwrappedType instanceof GraphQLInputObjectType) {
    const itc = new schema.InputTypeComposer(unwrappedType);
    if (restParts.length > 0) {
      return typeByPathITC(itc, restParts);
    }
    return itc;
  }

  if (restParts.length > 0) {
    return undefined;
  }
  return unwrappedType;
}
