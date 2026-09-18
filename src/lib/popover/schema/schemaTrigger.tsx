/**
 * Schema-typed PopoverTrigger Component Factory.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaTrigger
 */

import { useMemo, type ComponentType } from 'react';
import { PopoverTrigger, type PopoverTriggerProps } from '../components/PopoverTrigger';
import type { PopoverSchemaDefinition, SchemaKeys } from './schemaTypes';
import { mergeSchemaNodeOptions } from './schemaParams';

/**
 * Creates a schema-aware `<PopoverTrigger>` component pre-typed with the keys and display options of the schema.
 *
 * @template TSchema - Popover schema definition type.
 * @param definition - Popover schema definition dictionary.
 * @returns React component accepting typed `popoverKey` values from `TSchema`.
 *
 * @example
 * ```tsx
 * const SchemaTrigger = createSchemaTrigger(mySchema);
 *
 * function TriggerButton() {
 *   return <SchemaTrigger popoverKey="user"><button>Open User</button></SchemaTrigger>;
 * }
 * ```
 */
export function createSchemaTrigger<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): ComponentType<Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }> {
  const SchemaTrigger: ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  > = ({ popoverKey, placement, offset, options, ...restProps }) => {
    const node = definition[popoverKey];
    const { placement: nodePlacement, offset: nodeOffset } = node ?? {};
    const mergedPlacement = placement ?? nodePlacement;
    const mergedOffset = offset ?? nodeOffset;
    const mergedOptions = useMemo(() => mergeSchemaNodeOptions(node, options), [node, options]);

    return (
      <PopoverTrigger
        popoverKey={popoverKey}
        placement={mergedPlacement}
        offset={mergedOffset}
        options={mergedOptions}
        {...restProps}
      />
    );
  };
  SchemaTrigger.displayName = 'PopoverSchemaTrigger';
  return SchemaTrigger;
}
