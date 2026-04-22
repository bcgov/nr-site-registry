import { CustomScalar, Scalar } from '@nestjs/graphql';
import { FloatValueNode, Kind, ValueNode } from 'graphql';

@Scalar('LatLngTuple')
export class LatLngTupleScalar implements CustomScalar<
  number[],
  [number, number, number?]
> {
  description =
    'A tuple of two or three numbers representing latitude, longitude, and optionally altitude';

  parseValue(value: number[]): [number, number, number?] {
    if (!Array.isArray(value) || (value.length !== 2 && value.length !== 3)) {
      throw new Error('LatLngTuple must be an array of two or three numbers');
    }
    return value as [number, number, number?];
  }

  serialize(value: [number, number, number?]): number[] {
    return value;
  }

  parseLiteral(ast: ValueNode): [number, number, number?] {
    if (
      ast.kind === Kind.LIST &&
      (ast.values.length === 2 || ast.values.length === 3)
    ) {
      const [lat, lng, alt] = ast.values;
      if (
        lat.kind === Kind.FLOAT &&
        lng.kind === Kind.FLOAT &&
        (alt?.kind === Kind.FLOAT || alt === undefined)
      ) {
        return [
          parseFloat((lat as FloatValueNode).value),
          parseFloat((lng as FloatValueNode).value),
          alt ? parseFloat((alt as FloatValueNode).value) : undefined,
        ];
      }
    }
    throw new Error('LatLngTuple must be an array of two or three numbers');
  }
}
