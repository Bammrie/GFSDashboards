import express from 'express';
import { installCuLoanAdvisorProxy } from './ollama-proxy-hook.mjs';
import { installNcuaDirectory } from './ncua-directory-hook.mjs';
import { installNcuaClientProducts } from './ncua-client-products-hook.mjs';

installCuLoanAdvisorProxy(express);
installNcuaDirectory(express);
installNcuaClientProducts(express);

await import('../server.mjs');
