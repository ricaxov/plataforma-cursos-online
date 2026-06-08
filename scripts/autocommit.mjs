#!/usr/bin/env node
/**
 * Auto-commit watcher.
 * Observa o projeto e, alguns segundos após a última alteração, faz
 * git add + commit + push automaticamente.
 *
 * Uso: npm run autosave
 * Pare com Ctrl+C.
 */
import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const exec = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Espera este tempo (ms) sem novas mudanças antes de commitar.
const DEBOUNCE_MS = 5000;

// Pastas/arquivos que NÃO devem disparar um commit.
const IGNORED = ['.git', 'node_modules', 'dist', '.vite'];

let timer = null;
let committing = false;

function log(msg) {
  const t = new Date().toLocaleTimeString('pt-BR');
  console.log(`[autosave ${t}] ${msg}`);
}

async function git(args) {
  const { stdout } = await exec('git', args, { cwd: ROOT });
  return stdout.trim();
}

async function commitAndPush() {
  if (committing) return;
  committing = true;
  try {
    const status = await git(['status', '--porcelain']);
    if (!status) {
      log('Nada para commitar.');
      return;
    }
    await git(['add', '-A']);
    const stamp = new Date().toLocaleString('pt-BR');
    await git(['commit', '-m', `chore: autosave ${stamp}`]);
    log('Commit criado. Enviando para o remoto...');
    try {
      await git(['push']);
      log('Push concluído.');
    } catch (e) {
      log('Commit feito, mas o push falhou (verifique a conexão/credenciais): ' + e.message.split('\n')[0]);
    }
  } catch (e) {
    log('Erro: ' + e.message.split('\n')[0]);
  } finally {
    committing = false;
  }
}

function scheduleCommit() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(commitAndPush, DEBOUNCE_MS);
}

watch(ROOT, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  const path = filename.toString();
  if (IGNORED.some((dir) => path === dir || path.startsWith(dir + '/') || path.includes('/' + dir + '/'))) {
    return;
  }
  scheduleCommit();
});

log(`Observando alterações em ${ROOT}`);
log(`Commit automático ${DEBOUNCE_MS / 1000}s após a última mudança. Ctrl+C para parar.`);
