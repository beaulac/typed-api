export class ApiEndpoint<PATH extends string = string> {

  public readonly _path: PATH;

  public get _fullPath() {
    return `${this.parent ? this.parent.appendable : ''}${this._path}`;
  }

  private get appendable(): string {
    return `${this}/`;
  }

  public static newRoot<TRootUrl extends string, TApiDefinition extends IApiMap>(
    rootPath: TRootUrl,
    childPaths: TApiDefinition,
  ): ParentEndpoint<ApiEndpoint<TRootUrl>, typeof childPaths> {
    return new ApiEndpoint(rootPath).withChildren(childPaths);
  }

  private static stripSurroundingSlash(s: string): string {
    return s.replace(/(^\/+)|(\/+$)/, '');
  }

  private constructor(path: PATH,
                      private readonly parent?: ApiEndpoint) {
    this._path = ApiEndpoint.stripSurroundingSlash(path) as PATH;
  }

  public toString() {
    return this._fullPath;
  }

  private withChildren<ChildMap extends IApiMap>(
    childMap: ChildMap,
  ): ParentEndpoint<this, typeof childMap> {
    for (const route of Object.keys(childMap)) {
      (this as any)[route] = (childMap[route] === null)
        ? new ApiEndpoint(route, this)
        : new ApiEndpoint(route, this).withChildren(childMap[route]);
    }

    return this as ParentEndpoint<this, typeof childMap>;
  }

  public forID(id: string | number): string {
    return `${this.appendable}${id}`;
  }
}

type MapValue = IApiMap | null;

interface IApiMap {
  [path: string]: MapValue;
}

type MapOrEndpoint<V extends MapValue, P extends string> = V extends IApiMap ? ParentEndpoint<ApiEndpoint<P>, V> : ApiEndpoint<P>;

export type EndpointMap<T extends IApiMap> = {
  [P in keyof T]: MapOrEndpoint<T[P], P>
};

export type ParentEndpoint<TEndpoint extends ApiEndpoint, TChildMap extends IApiMap> =
  TEndpoint
  & EndpointMap<TChildMap>;

const apiMap = {
  users: { subscription: null },
  organization: {
    subOrg: null,
  },
};

const blah = ApiEndpoint.newRoot('http://test.com', apiMap);


export interface Endpoint {
  path: string;
}

console.log(`${blah.users.subscription.forID(1)}`);
console.log(`${blah.organization._fullPath}`);
