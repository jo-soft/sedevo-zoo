export interface IWebsocketMessage<TData, TType> {
  type: TType;
  data: TData;
}
