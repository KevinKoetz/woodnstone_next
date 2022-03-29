import { createContext, useEffect, useState, useContext, useMemo } from "react";
import { Token, User } from "../../../../types";
import jwt_decode from "jwt-decode";
import { Ability } from "@casl/ability";

const Context = createContext<{
  user: Omit<User, "password"> | null;
  token: string | null;
  ability: Ability;
  signIn: (
    username: string,
    password: string
  ) => Promise<Omit<User, "password"> | null>;
  signOut: () => void;
}>({
  user: null,
  token: null,
  ability: new Ability(),
  signIn: async () => null,
  signOut: () => {},
});

export const useAuth = () => useContext(Context);

export const useAbility = () => useContext(Context).ability;

export function Provider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [ability, setAbility] = useState<Ability>(new Ability());

  //Store the token in SessionStorage to persist between page reloads
  useEffect(() => {
    if (!token) return;
    sessionStorage.setItem("token", token);
    const payload = jwt_decode(token);
    if (!isToken(payload))
      throw new Error("Received unexpected Token from sessionStorage.");
    setUser(payload);
    //Clear the token when it expires
    const timeout = setTimeout(() => {
      setToken(null);
      setUser(null);
      sessionStorage.removeItem("token");
    }, (payload.exp - payload.iat) * 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [token]);

  const getAbility = useMemo(() => async () => {
    const response = await fetch("/rules", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const rules = await response.json();

    setAbility(new Ability(rules));
  }, [token])

  //Load the token from SessionStorage
  useEffect(() => {
    let token: string | null = sessionStorage.getItem("token");
    if (!token) return;
    if (!isToken(jwt_decode(token)))
      throw new Error("Received unexpected Token from sessionStorage.");
    getAbility()
    setToken(token);
    setUser(jwt_decode(token));
  }, [getAbility]);

  const signIn = async (username: string, password: string) => {
    try {
      let response = await fetch("/login", {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
        redirect: "error",
      });
      if (response.status !== 200) return null;
      const token = await response.text();
      const payload = jwt_decode(token);
      if (!isToken(payload))
        throw new Error("Received unexpected Token from /login route.");

      response = await fetch("/rules", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      getAbility()
      setToken(token);
      return payload;
    } catch (error) {
      return null;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setAbility(new Ability());
    sessionStorage.removeItem("token");
  };

  return (
    <Context.Provider value={{ user, token, ability, signIn, signOut }}>
      {children}
    </Context.Provider>
  );
}

function isToken(unknown: unknown): unknown is Token {
  if (!(typeof unknown === "object")) return false;
  if (unknown === null) return false;
  if (!("email" in unknown)) return false;
  if (!("role" in unknown)) return false;
  if (!("iat" in unknown)) return false;
  if (!("exp" in unknown)) return false;
  const c1 = unknown as {
    email: unknown;
    role: unknown;
    iat: number;
    exp: number;
  };

  if (!(typeof c1.email === "string")) return false;
  if (!(c1.role === "root" || c1.role === "admin" || c1.role === "customer"))
    return false;
  if (!(typeof c1.iat === "number")) return false;
  if (!(typeof c1.exp === "number")) return false;

  return true;
}
