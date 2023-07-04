export type EitherR<R> = { _tag: "Right"; right: R };
export type EitherL<L> = { _tag: "Left"; left: L };

export type Either<L, R> = EitherR<R> | EitherL<L>;

export const right = <R>(data: R): EitherR<R> => ({
  _tag: "Right",
  right: data,
});
export const left = <L>(data: L): EitherL<L> => ({ _tag: "Left", left: data });
