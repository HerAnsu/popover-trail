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

export function createSchemaTrigger<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): ComponentType<Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }> {
  const SchemaTrigger: ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  > = ({ popoverKey, placement, offset, options, ...restProps }) => {
    const node = definition[popoverKey];
    const mergedPlacement = placement ?? node?.placement;
    const mergedOffset = offset ?? node?.offset;
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
