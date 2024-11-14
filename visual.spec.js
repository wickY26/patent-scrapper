import { test } from 'playwright/test';
import { getNiceDescriptions } from './script.js';

test('Patent application number search', getNiceDescriptions);