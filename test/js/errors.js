export function errors() {
    return Promise.resolve()
	.test(() => {
	    try {
		lisp.cons();
	    } catch (e) {
		if (!e) {
		    throw new Error("lisp.cons() failed to throw");
		}
	    }
	})
	.test(() => {
	    let sent = null;
	    const failure = 'fail';
	    lisp.defun({
		name: "ng-test--toplevel",
		func: () => {
		    lisp.ng_test__low_inner();
		    sent = failure;
		}
	    });

	    lisp.defun({
		name: "ng-test--low-inner",
		func: () => {
		    lisp.ng_test__deep_inner();
		    sent = failure;
		}
	    });

	    lisp.defun({
		name: "ng-test--deep-inner",
		func: () => {
		    throw new Error("Intentional");
		}
	    });

	    let caught = false;
	    try {
		lisp.ng_test__toplevel();
	    } catch (e) {
		caught = true;
		if (!e) {
		    throw new Error("Failed to catch error..");
		}

		if (!!sent) {
		    throw new Error("Failed to early out.");
		}
	    }

	    if (!caught) {
		throw new Error("Did not throw error within defun");
	    }
	})
	.test(() => {
	    let thrown = false;
	    try {
		lisp.make.string('\0');
	    } catch(e) {
		thrown = true;
		if (!e) {
		    throw new Error("Nul byte in string did not error");
		}
	    }

	    if (!thrown) {
		throw new Error("Nul byte did not throw");
	    }
	})
	.test(() => {
	    lisp.defun({
		name: "ng-test--fx--1",
		func: (callback) => {
		    callback.json();
		}
	    });

	    lisp.defun({
		name: "ng-test--fx--2",
		func: () => {
		    lisp.ng_test__fx__1(() => console.log('foo'));
		}
	    });

	    lisp.ng_test__fx__2();
	});
};
