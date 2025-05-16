import { CloseDoneFunction } from '../../core/server/nodes';
import { ConfigNode } from '../../core/server/nodes';
import { ConfigNodeValidations } from '../../core/server/nodes';
import { ConfigsSchema } from '../../schemas/your-node';
import { ConfigsSchema as ConfigsSchema_2 } from '../../schemas/remote-server';
import { CredentialsSchema } from '../../schemas/your-node';
import { InputDoneFunction } from '../../core/server/nodes';
import { InputMessageSchema } from '../../schemas/your-node';
import { IONode } from '../../core/server/nodes';
import { IONodeValidations } from '../../core/server/nodes';
import { OutputMessageSchema } from '../../schemas/your-node';
import { SendFunction } from '../../core/server/nodes';
import { Static } from '@sinclair/typebox';

declare function (RED: any): Promise<void>;
export default default_2;

export declare class RemoteServerConfigNode extends ConfigNode<RemoteServerConfigs> {
    static validations: ConfigNodeValidations;
    static init(): Promise<void>;
}

declare type RemoteServerConfigs = Static<typeof ConfigsSchema_2>;

export declare class YourNode extends IONode<YourNodeConfigs, YourNodeCredentials, YourNodeInputMessage, YourNodeOutputMessage> {
    static validations: IONodeValidations;
    static init(): Promise<void>;
    onInput(msg: {
        payload?: string | undefined;
        topic?: string | undefined;
        _msgid?: string | undefined;
    } & {
        myVariable?: string | undefined;
    }, send: SendFunction<{
        payload?: string | undefined;
        topic?: string | undefined;
        _msgid?: string | undefined;
    } & {
        originalType: "string" | "number";
        processedTime: number;
    }>, done: InputDoneFunction): Promise<void>;
    onClose(removed: boolean, done: CloseDoneFunction): Promise<void>;
}

declare type YourNodeConfigs = Static<typeof ConfigsSchema>;

declare type YourNodeCredentials = Static<typeof CredentialsSchema>;

declare type YourNodeInputMessage = Static<typeof InputMessageSchema>;

declare type YourNodeOutputMessage = Static<typeof OutputMessageSchema>;

export { }
