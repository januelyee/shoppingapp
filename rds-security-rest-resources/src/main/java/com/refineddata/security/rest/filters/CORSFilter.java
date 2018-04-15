package com.refineddata.security.rest.filters;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 *
 * @author Januel P. Yee
 * @version %I%, %G%, Last Modified 09/16/2016
 * @since 1.0
 */
public class CORSFilter implements Filter {
    public CORSFilter() { }

    @Override
    public void init(FilterConfig fConfig) throws ServletException { }

    @Override
    public void destroy() {	}

    @Override
    public void doFilter(
        ServletRequest servletRequest, ServletResponse servletResponse,
        FilterChain filterChain) throws IOException, ServletException {

        ((HttpServletResponse) servletResponse).addHeader(
            "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
        );

        ((HttpServletResponse) servletResponse).addHeader(
            "Access-Control-Allow-Headers", "X-Requested-With, Content-Type"
        );

        ((HttpServletResponse) servletResponse).addHeader(
            "Cache-Control", "no-cache, no-store, must-revalidate"
        );

        ((HttpServletResponse) servletResponse).addHeader(
            "Pragma", "no-cache"
        );

        ((HttpServletResponse) servletResponse).setDateHeader(
            "Expires", 0
        );

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
