function log(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        let ags = JSON.stringify(args)
        console.log(`${originalMethod.name}(${ags})`)
    }
    return descriptor
}

class MyClass {
    @log
    myMethod(arg: string) {
        return "Message -- " + arg;
    }
}

let cl = new MyClass()
cl.myMethod('ss')