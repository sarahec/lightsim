{
  description = "A basic flake with a shell";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
    in {
      devShells.default = pkgs.mkShell {
        packages = [ 
          pkgs.bashInteractive
          # pkgs.cypress
          pkgs.nodejs_20
          # For prisma
          # pkgs.nodePackages.prisma
          # pkgs.prisma-engines
          # pkgs.openssl
          # pkgs.sqlite
          # For nix editing
          pkgs.nixd
        ];
        shellHook = with pkgs; ''
          # export PRISMA_MIGRATION_ENGINE_BINARY="${prisma-engines}/bin/migration-engine"
          # export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
          # export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
          # export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
          # export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
          # export PRISMA_GENERATE_BINARY="${prisma-engines}/bin/prisma-generate-schema"
          
          # export CYPRESS_INSTALL_BINARY=0
          # export CYPRESS_RUN_BINARY=${pkgs.cypress}/bin/Cypress
          npm set prefix ~/.npm-global
          export PATH=$PATH:~/.npm-global/bin
        '';
      };
    });
}
