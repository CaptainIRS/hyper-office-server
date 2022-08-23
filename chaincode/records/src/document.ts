/*
 * SPDX-License-Identifier: MIT
 */

import { Object, Property } from 'fabric-contract-api';
import './state';
import { State } from './state';
import { User } from './user';

@Object()
export class Document {

    @Property()
    public owner: User;

    @Property()
    public hash: string;

    @Property('completedStates', 'Array<State>')
    public completedStates: State[];

    @Property('nextState', 'State')
    public nextState: State | undefined;

    @Property('pendingStates', 'Array<State>')
    public pendingStates: State[];

    @Property()
    public transactions: string;

}
