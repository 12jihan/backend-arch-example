defmodule ElixirappWeb.TestController do
  use ElixirappWeb, :controller

  def index(conn, _params) do
    json(conn, %{message: "This is a test"})
  end
end
