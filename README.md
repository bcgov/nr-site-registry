# Site Registry

## Developer Onboarding.

1. You need a docker daemon. I have tested both of these:
    - Docker Desktop works and requires no configuration, but it does have a
      non-FOSS license.
    - [Colima](https://github.com/abiosoft/colima) is FOSS software that
      provides a docker daemon for Mac. I recommend editing the configuration to
      use at _least_ 4GB of memory to avoid memory allocation errors in this
      project, and to use the `vz` backend with `virtiofs` file mounting. I've
      had issues with the `qemu` and `sshfs` backends in the past. Also: Colima
      provides a docker daemon by default, but it _also_ has the ability to
      provide a podman daemon, so make sure it is set to docker. You can bring
      it up with `colima start --edit` to review the configuration.

      `brew install colima`

1. You will also need `docker` and `docker-compose` command line tools. These
   are FOSS.

   `brew install docker docker-compose`

1. The docker setup _should_ handle all your node needs, but I recommend having
   a local install for ease of use.

   `brew install npm`

1. Copy the `.env.example` files in the `backend/` and `frontend/` directories
   to `.env` in their respective locations and edit them. You will need to get
   secret information from another dev.

1. Now you can run `docker-compose up -d` from the project root.
   It will probably take a few minutes to start up the first time.

1. You will need a database seed. Ask one of the other devs for it. I plan on
   implementing an automatic database seeder in the nearish future.

1. Happy Hacking! The frontend runs on http://127.0.0.1:4000 by default. Check
   the included example `.vscode/launch-example.jsonc` and
   `.vscode/tasks-example.jsonc` for more information.