/* Copyright (c) 2019 The node-webrtc project authors. All rights reserved.
 *
 * Use of this source code is governed by a BSD-style license that can be found
 * in the LICENSE.md file in the root of the source tree. All contributing
 * project authors may be found in the AUTHORS file in the root of the source
 * tree.
 */
#pragma once

#include "src/utilities/bidi_map.h"

namespace node_webrtc {

template <typename T, typename U, typename... V> class Wrap {
public:
  Wrap() = delete;

  explicit Wrap(T (*Create)(V..., U)) : _Create(Create) {}

  Wrap(Wrap const &) = delete;

  Wrap &operator=(Wrap const &) = delete;

  T GetOrCreate(V... args, U key) {
    return _map.computeIfAbsent(key, [this, key, args...]() {
      auto out = _Create(args..., key);
      // NOTE(jack): If we do not do this, then out is liable to be
      // garbage-collected by Javascript, which can lead to all sorts of
      // nasty problems. So long as `Release()` is called appropriately for
      // objects that are removed from the map, everything works.
      out->Ref();
      return out;
    });
  }

  T Get(U key) { return _map.get(key).FromMaybe(nullptr); }

  void Release(T value) {
    if (!value->IsEmpty() && _map.reverseHas(value)) {
      // `Release()` can be called from objects that were made not through
      // the wrap interface, so only unref if they were created from here.
      value->Unref();
    }
    _map.reverseRemove(value);
  }

private:
  T (*_Create)(V..., U);
  BidiMap<U, T> _map;
};

} // namespace node_webrtc
