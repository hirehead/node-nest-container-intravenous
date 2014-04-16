/// <reference path="_ref.d.ts" />

var intravenous = require('intravenous');

interface ServiceRegistration {
    service: string;
    key: string;
    factory: () => Nest.IPromise < any > ;
}

class NestContainerIntravenous implements Nest.IContainer {

    container: Intravenous.Container;
    services: Array < ServiceRegistration > ;

    constructor() {
        this.container = intravenous.create();
        this.services = [];
    }

    get < T > (service: string, key ? : string): Nest.IPromise < T > {
        var svc: any;

        if (key)
            svc = this.container.get < any > (service + '-' + key)
        else
            svc = this.container.get < any > (service);

        return svc && < Nest.IPromise < T >> svc.promis;
    }

    register(name: string, key: string, factory: () => Nest.IPromise < any > ): Nest.IContainer {
        this.services.push({
            service: name,
            key: key,
            factory: factory
        });
        return this;
    }

    start() {
        for (var i = 0; i < this.services.length; ++i) {
            var service = this.services[i];

            // return should be function and not () => {}, 
            // because of "this", it nust not generate "_this" in js
            // intravenous require that we should pass constructor inside
            // so we set field value of the constructed object into 
            var factory = service.key ? (fctr: () => Nest.IPromise < any > ) => {
                var promis: Nest.IPromise < any > ;
                return function() {
                    this.promis = promis || (promis = fctr());
                }
            } : (fctr: () => Nest.IPromise < any > ) => {
                return function() {
                    this.promis = fctr();
                }
            };

            var f = factory(service.factory);

            if (service.key) {
                this.container.register(
                    service.service + '-' + service.key,
                    f,
                    "singleton");
                this.container.register(
                    service.service,
                    f,
                    "singleton");
            } else
                this.container.register(
                    this.services[i].service,
                    f,
                    "singleton");
        }
    }
}

module.exports.step = function(app?: Nest.INest) : Nest.INest {
    app.container = new NestContainerIntravenous();
    return app;
}

module.exports.step_start = function(app?: Nest.INest) : Nest.INest {
    ( < NestContainerIntravenous > app.container).start();
    return app;
}