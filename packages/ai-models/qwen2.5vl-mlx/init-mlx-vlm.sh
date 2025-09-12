# Specify the GCC compilers from Homebrew
export CC=$(brew --prefix gcc)/bin/gcc-14
export CXX=$(brew --prefix gcc)/bin/g++-14

# Set Linker flags to find OpenBLAS and libomp libraries
export LDFLAGS="-L$(brew --prefix openblas)/lib -L$(brew --prefix libomp)/lib"

# Set C Preprocessor flags to find OpenBLAS and libomp headers
export CPPFLAGS="-I$(brew --prefix openblas)/include -I$(brew --prefix libomp)/include"

# Set the pkg-config path to help find OpenBLAS configuration
export PKG_CONFIG_PATH="$(brew --prefix openblas)/lib/pkgconfig"