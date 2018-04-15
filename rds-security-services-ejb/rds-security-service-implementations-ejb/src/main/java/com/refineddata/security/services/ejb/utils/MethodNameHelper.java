package com.refineddata.security.services.ejb.utils;

import java.lang.reflect.Method;

/**
 * Helper class to determine current method name being called.
 *
 * To use this helper class, you need to have an empty static inner class that extends this class.
 *
 * Example:
 *
 * {@code
 *      private static class MyMethodNameHelper extends MethodNameHelper {
 *
 *      }
 * }
 *
 * And then in your target method, do the following:
 *
 * {@code
 *      String testName = (new MyMethodNameHelper()).getName();
 * }
 *
 * or
 *
 * {@code
 *      Method me = (new MyMethodNameHelper()).getMethod();
 * }
 *
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/13/2016
 * @since 1.0
 */
public abstract class MethodNameHelper {

    public String getName() {
        final Method myMethod = this.getClass().getEnclosingMethod();
        if (null == myMethod) {
            // This happens when we are non-anonymously instantiated
            return this.getClass().getSimpleName() + ".unknown()"; // return a less useful string
        }
        final String className = myMethod.getDeclaringClass().getSimpleName();
        return className + "." + myMethod.getName() + "()";
    }


    public Method getMethod() {
        return this.getClass().getEnclosingMethod();
    }
}
