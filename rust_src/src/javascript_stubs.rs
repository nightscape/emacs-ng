#[cfg(not(feature = "javascript"))]
use lisp::lisp::LispObject;
#[cfg(not(feature = "javascript"))]
use lisp::remacs_sys::Qnil;
#[cfg(not(feature = "javascript"))]
use lisp_macros::lisp_fn;

// This file is used to stub out functions when emacs-ng is compiled without javascript
#[cfg(not(feature = "javascript"))]
#[lisp_fn]
pub fn js__sweep() -> LispObject {
    Qnil
}

include!(concat!(env!("OUT_DIR"), "/javascript_stubs_exports.rs"));
