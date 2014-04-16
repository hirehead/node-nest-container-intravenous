declare module Intravenous {

    export interface DisponseConfig {

        onDispose(obj: any, serviceName: string);

    }

    export interface Container {

        /**
         * @param lifecycle: 'perRequest' (default), ''unique, 'singleton'
         */
        register(serviceName: string, service: any, lifecycle?: string);

        //service.$inject = ["logger", "optionalDependency?"];
        //myClass.$inject = ["widgetFactory"]; will return IFactory
        //myClass.$inject = ["widget!"]; will return IFactory
        //How can I get access to the main intravenous container?
        //myClass.$inject = ["container", /* ... other dependencies */];
        /**
         * @param lifecycle: 'perRequest' (default), ''unique, 'singleton'
         */
        register(serviceName: string, service: Function, lifecycle?: string);

        // args parameters to constructor, after injection
        get < T > (serviceName: string, ...arg: Array < any > ): T;

        dispose();

        //What if I want to dispose only parts of the container, instead of everything?
        //var nested = container.create();
        //var myInstance = nested.get("myClass");
        create(): Container;
    }

    export interface IFactory < T > {
        get(): T;
        dispose(instance: T);
        //this.myWidget = widgetFactory.use("foo", "value1").get();
        //this.myWidget2 = widgetFactory.use("foo", fooClass).get();
        //this.myWidget.foo will now be "value1"
        //this.myWidget2.foo will now be an instance of "fooClass"
        use(name: string, value: any): IFactory < T > ;
    }
}

declare module "intravenous" {
    export
    function create(config ? : Intravenous.DisponseConfig): Intravenous.Container;
}