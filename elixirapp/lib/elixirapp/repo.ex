defmodule Elixirapp.Repo do
  use Ecto.Repo,
    otp_app: :elixirapp,
    adapter: Ecto.Adapters.Postgres
end
