function isSubclassOf(child: Function, parent: Function): boolean {
  if (child === parent) return false;

  let proto = child.prototype;
  while (proto) {
    proto = Object.getPrototypeOf(proto);
    if (proto?.constructor === parent) return true;
  }
  return false;
}

// TODO: find a package that can do type convertion at runtime using design:type
function convertToType(value: any, type: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (type === String) {
    return String(value);
  } else if (type === Number) {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  } else if (type === Boolean) {
    if (typeof value === "string") {
      return !["false", "0", ""].includes(value.toLowerCase());
    }
    return Boolean(value);
  } else if (type === Date) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } else if (type === Array) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(",").map((item) => item.trim());
      }
    }
    return Array.isArray(value) ? value : [value];
  } else if (type === Object) {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return typeof value === "object" && !Array.isArray(value)
      ? value
      : { value };
  }

  if (typeof type === "function") {
    try {
      return new type(value);
    } catch {
      return value;
    }
  }

  return value;
}

export { isSubclassOf, convertToType };
