import {
  GraphQLSchema,
  GraphQLNamedType,
  GraphQLDirective,
  SchemaDefinitionNode,
  GraphQLResolveInfo,
} from 'graphql';
import { TypeComposer, TypeComposerDefinition } from './TypeComposer';
import {
  InputTypeComposer,
  InputTypeComposerDefinition,
} from './InputTypeComposer';
import {
  EnumTypeComposer,
  EnumTypeComposerDefinition,
} from './EnumTypeComposer';
import {
  InterfaceTypeComposer,
  InterfaceTypeComposerDefinition,
} from './InterfaceTypeComposer';
import {
  UnionTypeComposer,
  UnionTypeComposerDefinition,
} from './UnionTypeComposer';
import { TypeStorage } from './TypeStorage';
import { TypeMapper } from './TypeMapper';
import { Resolver } from './Resolver';

type MustHaveTypes<TContext> =
  | TypeComposer<any, TContext>
  | InputTypeComposer
  | EnumTypeComposer
  | InterfaceTypeComposer<TContext>
  | UnionTypeComposer<TContext>
  | GraphQLNamedType;

type ExtraSchemaConfig = {
  types?: GraphQLNamedType[] | null;
  directives?: GraphQLDirective[] | null;
  astNode?: SchemaDefinitionNode | null;
};

type AddResolveMethods<TContext> = {
  [typeName: string]: {
    [fieldName: string]: (
      source: any,
      args: {},
      context: TContext,
      info: GraphQLResolveInfo,
    ) => any;
  };
};

export class SchemaComposer<TContext> extends TypeStorage<TContext> {
  public TypeMapper: TypeMapper;
  public TypeComposer: typeof TypeComposer;
  public InputTypeComposer: typeof InputTypeComposer;
  public EnumTypeComposer: typeof EnumTypeComposer;
  public InterfaceTypeComposer: typeof InterfaceTypeComposer;
  public UnionTypeComposer: typeof UnionTypeComposer;
  public Resolver: typeof Resolver;

  public Query: TypeComposer<any, TContext>;
  public Mutation: TypeComposer<any, TContext>;
  public Subscription: TypeComposer<any, TContext>;

  protected _schemaMustHaveTypes: Array<MustHaveTypes<TContext>>;
  protected _directives: GraphQLDirective[];

  public constructor();

  public rootQuery<TRootQuery = any>(): TypeComposer<TRootQuery, TContext>;

  public rootMutation<TRootMutation = any>(): TypeComposer<
    TRootMutation,
    TContext
  >;

  public rootSubscription<TRootSubscription = any>(): TypeComposer<
    TRootSubscription,
    TContext
  >;

  public buildSchema(extraConfig?: ExtraSchemaConfig): GraphQLSchema;

  public addSchemaMustHaveType(type: MustHaveTypes<TContext>): this;

  public removeEmptyTypes(
    typeComposer: TypeComposer<any, TContext>,
    passedTypes: Set<string>,
  ): void;

  public getOrCreateTC<TSource = any>(
    typeName: string,
    onCreate?: (tc: TypeComposer<TSource, TContext>) => any,
  ): TypeComposer<TSource, TContext>;

  public getOrCreateITC(
    typeName: string,
    onCreate?: (itc: InputTypeComposer) => any,
  ): InputTypeComposer;

  public getOrCreateETC(
    typeName: string,
    onCreate?: (etc: EnumTypeComposer) => any,
  ): EnumTypeComposer;

  public getOrCreateIFTC(
    typeName: string,
    onCreate?: (iftc: InterfaceTypeComposer<TContext>) => any,
  ): InterfaceTypeComposer<TContext>;

  public getOrCreateUTC(
    typeName: string,
    onCreate?: (utc: UnionTypeComposer<TContext>) => any,
  ): UnionTypeComposer<TContext>;

  public addTypeDefs(typeDefs: string): TypeStorage<GraphQLNamedType>;

  public addResolveMethods(
    typesFieldsResolve: AddResolveMethods<TContext>,
  ): void;

  // alias for createObjectTC
  public createTC(
    typeDef: TypeComposerDefinition<TContext>,
  ): TypeComposer<TContext>;

  public createObjectTC(
    typeDef: TypeComposerDefinition<TContext>,
  ): TypeComposer<TContext>;

  public createInputTC(typeDef: InputTypeComposerDefinition): InputTypeComposer;

  public createEnumTC(typeDef: EnumTypeComposerDefinition): EnumTypeComposer;

  public createInterfaceTC(
    typeDef: InterfaceTypeComposerDefinition<TContext>,
  ): InterfaceTypeComposer<TContext>;

  public createUnionTC(
    typeDef: UnionTypeComposerDefinition<TContext>,
  ): UnionTypeComposer<TContext>;

  public addDirective(directive: GraphQLDirective): this;

  public removeDirective(directive: GraphQLDirective): this;

  public getDirectives(): GraphQLDirective[];

  public hasDirective(directive: string | GraphQLDirective): boolean;
}
