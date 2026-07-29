import express from 'express';
import { installCuLoanAdvisorProxy } from './ollama-proxy-hook.mjs';
import { installNcuaDirectory } from './ncua-directory-hook.mjs';

installCuLoanAdvisorProxy(express);
installNcuaDirectory(express);

await import('../server.mjs');
