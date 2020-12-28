(() => {
    let global = (1,eval)('this');
    let __weak = [];
    let finalize = global.finalize;
    delete global.finalize;
    let lisp_json = global.lisp_json;
    delete global.lisp_json;

    global.errorFuncs = {
	eval_js: true,
	eval_js_file: true,
	recursive_edit: true,
    };

    const specialForms = {
	hashtable: (a) => json_lisp(JSON.stringify(a), 0),
	alist: (a) => json_lisp(JSON.stringify(a), 1),
	plist: (a) => json_lisp(JSON.stringify(a), 2),
	array: (a) => json_lisp(JSON.stringify(a), 3),
	list: (a) => json_lisp(JSON.stringify(a), 4),
    };

    // Hold on you fool, why not use FinalizerRegistry, it
    // was made for this! That API does not work in Deno
    // at this time, due to their handling of the DefaultPlatform
    // Due to this, I opt'd to use weakrefs in a map. Its nice
    // because I just need to sync that map with a lisp gc root
    // and my job is done.
    // @TODO either make that time for sync customizable
    // or explore better options than hardcoding 10s.
    setInterval(() => {
        const nw = [];
        const args = [];
        __weak.forEach((e) => {
            let x = e.deref();
            if (x) {
                nw.push(e);
                args.push(x);
            }
            finalize.apply(this, args);
        });
        __weak = nw;
    }, 10000);

    global.lisp = new Proxy({}, {
        get: function(o, k) {
	    if (errorFuncs[k]) {
		throw new Error("Attempting to call non-supported function via javascript invokation (" + k + ")");
	    }

	    if (k === 'q') {
		return new Proxy({}, {
		    get: function(o, k) {
			return lisp.intern(k.replaceAll('_', '-'));
		    }
		});

	    }

	    if (k === 'alloc') {
		return specialForms;
	    }

            return function() {
                const modargs = [k.replaceAll('-', '_')];
                for (let i = 0; i < arguments.length; ++i) {
                    if (is_proxy(arguments[i])) {
                        modargs.push(arguments[i]);
                    } else {
                        modargs.push(JSON.stringify(arguments[i]));
                    }
                }
                let result = lisp_invoke.apply(this, modargs);
                let retval = null;
                if (is_proxy(result)) {
                    result.json = () => {
                        return JSON.parse(lisp_json(result));
                    };

                    __weak.push(new WeakRef(result));
                    retval = result;
                } else {
                    retval = JSON.parse(result);
                }

                return retval;
            }

        }});
})();
