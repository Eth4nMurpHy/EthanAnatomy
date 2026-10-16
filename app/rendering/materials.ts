import * as T from "three";
import { SYSTEMS } from "../core/anatomy";

// Three.js converts these sRGB colors to the linear space used by the shader.
// A medium teal separates selected bone without making its surface too dark.
const selectionColor = new T.Color("#42aaa2");
const selectionEdgeColor = new T.Color("#7bdccc");

export function createAnatomyMaterial(
  system: string,
  partTexture: T.DataTexture,
  selectionTexture: T.DataTexture,
  width: number,
) {
  const m = new T.MeshStandardMaterial({
    color: SYSTEMS.find((s) => s.id === system)?.color ?? "#aebbb8",
    metalness: 0.08,
    roughness: 0.53,
    side: T.DoubleSide,
    transparent: system === "integumentary",
    opacity: system === "integumentary" ? 0.1 : 1,
    depthWrite: system !== "integumentary",
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.partState = { value: partTexture };
    shader.uniforms.selectionState = { value: selectionTexture };
    shader.uniforms.stateWidth = { value: width };
    shader.uniforms.selectionColor = { value: selectionColor };
    shader.uniforms.selectionEdgeColor = { value: selectionEdgeColor };
    shader.vertexShader =
      "attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partSelected;\n" +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partSelected = texture2D(selectionState, stateUv).r;",
    );
    shader.fragmentShader =
      "varying float partSelected; uniform vec3 selectionColor; uniform vec3 selectionEdgeColor;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, selectionColor, partSelected * 0.90);",
    );
    // View-dependent edge light preserves shape without another render pass,
    // duplicated geometry, or a continuously running highlight animation.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `float selectionRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);
outgoingLight = mix(outgoingLight, outgoingLight * 0.97 + selectionColor * 0.04 + selectionEdgeColor * selectionRim * 0.20, partSelected);
#include <opaque_fragment>`,
    );
  };
  return m;
}
