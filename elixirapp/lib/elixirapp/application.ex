defmodule Elixirapp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Elixirapp.Repo,
      ElixirappWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:elixirapp, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Elixirapp.PubSub},
      # Start a worker by calling: Elixirapp.Worker.start_link(arg)
      # {Elixirapp.Worker, arg},
      # Start to serve requests, typically the last entry
      ElixirappWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Elixirapp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ElixirappWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
