/**
 * v2 adapter shim for legacy `style-parsing` helpers used by spanState. v2
 * detection-engine doesn't yet expose equivalent parsers, so re-export legacy
 * here behind the v2 boundary for Phase 8 isolation.
 */
export * from '../../../editor/styling-engine/tag-manipulation/style-parsing/StyleParsing';
