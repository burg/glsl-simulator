# Build script borrowed from PEG.js

# ===== Variables =====
VERSION_FILE = VERSION
GLSL_SIMULATOR_VERSION = `cat $(VERSION_FILE)`

# ===== Modules =====

# Order matters -- dependencies must be listed before modules dependent on them.
MODULES = error                                 \
          events                                \
          runtime/vector                        \
          runtime/matrix                        \
          runtime/access                        \
          runtime/internal                      \
          runtime/builtins                      \
          runtime/ops                           \
          runtime/environment                   \
          runtime                               \
          compiler/ast                          \
          compiler/visitor                      \
          compiler/typecheck                    \
          compiler/pretty                       \
          compiler/codegen                      \
          compiler/parser                       \
          compiler/shader                       \
          compiler/program                      \
          glsl                                  \


# ===== Directories =====

SRC_DIR              = src
LIB_DIR              = lib
BIN_DIR              = bin
BROWSER_DIR          = browser
NODE_MODULES_DIR     = node_modules
NODE_MODULES_BIN_DIR = $(NODE_MODULES_DIR)/.bin

# ===== Files =====

PARSER_SRC_FILE = $(SRC_DIR)/glsl.pegjs
PARSER_OUT_FILE = $(LIB_DIR)/compiler/parser.js

BROWSER_FILE_DEV = $(BROWSER_DIR)/glsl-simulator-$(GLSL_SIMULATOR_VERSION).js
BROWSER_FILE_MIN = $(BROWSER_DIR)/glsl-simulator-$(GLSL_SIMULATOR_VERSION).min.js

VERSION_FILE = VERSION

# ===== Executables =====
# Use '$ npm install pegjs uglify-js' from repository root to install dependencies locally.

UGLIFYJS      = $(NODE_MODULES_BIN_DIR)/uglifyjs
PEGJS         = $(NODE_MODULES_BIN_DIR)/pegjs

# ===== Targets =====

# Default target
all: parser browser

# Generate the grammar parser
parser:
	$(PEGJS) -o $(PARSER_OUT_FILE) $(PARSER_SRC_FILE) 

# Build the browser version of the library
browser:
	mkdir -p $(BROWSER_DIR)

	rm -f $(BROWSER_FILE_DEV)
	rm -f $(BROWSER_FILE_MIN)

	# The following code is inspired by CoffeeScript's Cakefile.

	echo '/*'                                                                          >> $(BROWSER_FILE_DEV)
	echo "  glsl-simulator.js $(GLSL_SIMULATOR_VERSION)"                               >> $(BROWSER_FILE_DEV)
	echo '  https://www.github.com/burg/glsl-simulator/'                               >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo '  Copyright (c) 2014, Brian Burg <burg@cs.uw.edu>'                           >> $(BROWSER_FILE_DEV)
	echo '  Copyright (c) 2014, Xiao Sophia Wang.'                                     >> $(BROWSER_FILE_DEV)
	echo '  All rights reserved.'                                                      >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo '  Distributed under the terms of the Simplified BSD License:'                >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	cat ./BSD-LICENSE >> $(BROWSER_FILE_DEV)
	echo '*/'                                                                          >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo 'var GLSL = (function(undefined) {'                                           >> $(BROWSER_FILE_DEV)
	echo '  var modules = {'                                                           >> $(BROWSER_FILE_DEV)
	echo '    define: function(name, factory) {'                                       >> $(BROWSER_FILE_DEV)
	echo '      var dir    = name.replace(/(^|\/)[^/]+$$/, "$$1"),'                    >> $(BROWSER_FILE_DEV)
	echo '          module = { exports: {} };'                                         >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo '      function require(path) {'                                              >> $(BROWSER_FILE_DEV)
	echo '        var name   = dir + path,'                                            >> $(BROWSER_FILE_DEV)
	echo '            regexp = /[^\/]+\/\.\.\/|\.\//;'                                 >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo "        /* Can't use /.../g because we can move backwards in the string. */" >> $(BROWSER_FILE_DEV)
	echo '        while (regexp.test(name)) {'                                         >> $(BROWSER_FILE_DEV)
	echo '          name = name.replace(regexp, "");'                                  >> $(BROWSER_FILE_DEV)
	echo '        }'                                                                   >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo '        return modules[name];'                                               >> $(BROWSER_FILE_DEV)
	echo '      }'                                                                     >> $(BROWSER_FILE_DEV)
	echo ''                                                                            >> $(BROWSER_FILE_DEV)
	echo '      factory(module, require);'                                             >> $(BROWSER_FILE_DEV)
	echo '      this[name] = module.exports;'                                          >> $(BROWSER_FILE_DEV)
	echo '    }'                                                                       >> $(BROWSER_FILE_DEV)
	echo '  };'                                                                        >> $(BROWSER_FILE_DEV)

	for module in $(MODULES); do                                                                \
		echo "  modules.define(\"$$module\", function(module, require) {" >> $(BROWSER_FILE_DEV); \
		sed -e 's/^/    /' lib/$$module.js                                >> $(BROWSER_FILE_DEV); \
		echo '  });'                                                      >> $(BROWSER_FILE_DEV); \
		echo ''                                                           >> $(BROWSER_FILE_DEV); \
	done

	echo '  return modules["glsl"]' >> $(BROWSER_FILE_DEV)
	echo '})();'                   >> $(BROWSER_FILE_DEV)

	$(UGLIFYJS)                 \
		--mangle                  \
		--compress  \
		--comments /Simplified\ BSD\ License/    \
		-o $(BROWSER_FILE_MIN)    \
		$(BROWSER_FILE_DEV)

# Remove browser version of the library (created by "browser")
browserclean:
	rm -rf $(BROWSER_DIR)

.PHONY:  all parser browser browserclean
.SILENT: all parser browser browserclean
