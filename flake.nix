{
  description = "A very basic flake";
  # Provides abstraction to boiler-code when specifying multi-platform outputs.
  inputs.flake-utils.url = "github:numtide/flake-utils";
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShell = with pkgs; mkShell {
        buildInputs = [ nodePackages.node2nix 
         nodejs-14_x 
         pkg-config
         autoreconfHook 
         pkgconfig 
         autoconf
         automake
         libtool
         nasm
         autogen 
         zlib 
         autoconf-archive
         binutils
        ];
        #LD_LIBRARY_PATH = "${libpng.out}/libpng";  
         shellHook = ''
			LD=$CC
		'';
      };
    });
}
