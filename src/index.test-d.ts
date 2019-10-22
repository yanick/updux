import updux, {Updux } from '.';
import {expectType} from 'tsd';

const x = updux({});
expectType<Updux>(x);
