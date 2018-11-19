import { GraphQLObjectType, GraphQLScalarType, GraphQLEnumType, GraphQLUnionType } from "graphql"

// Used for GraphQL diffing
// See: https://github.com/jarwol/graphql-schema-utils/blob/master/lib/diff.js
//

type GraphQLy =
  | GraphQLObjectType
  | GraphQLScalarType
  | GraphQLEnumType
  // | GraphQLNonNull<GraphQLObjectType>
  // | GraphQLList<GraphQLObjectType>
  | GraphQLUnionType

type DiffTypes =
  | "TypeDescriptionDiff"
  | "TypeMissing"
  | "TypeNameDiff"
  | "BaseTypeDiff"
  | "UnionTypeDiff"
  | "InterfaceDiff"
  | "FieldDescriptionDiff"
  | "FieldMissing"
  | "FieldDiff"
  | "ArgDescriptionDiff"
  | "ArgDiff"
  | "EnumDiff"

export type GraphQLDiff = {
  /** Reference from the old schema */
  thisType: GraphQLy
  /** Reference from the new schema */
  otherType: GraphQLy
  diffType: DiffTypes
  backwardsCompatible: boolean
}
