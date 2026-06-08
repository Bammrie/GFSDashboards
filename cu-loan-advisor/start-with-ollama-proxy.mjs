import express from 'express';
import { installCuLoanAdvisorProxy } from './ollama-proxy-hook.mjs';

installCuLoanAdvisorProxy(express);

await import('../server.mjs');
