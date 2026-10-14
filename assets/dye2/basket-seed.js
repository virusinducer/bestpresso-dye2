  // bestpresso-dye-builds: carry the basket chosen for this shot (workflow context) into its annotations.
  if (!shot.__bpSeeded) {
    shot.__bpSeeded = true;
    const wfx = ctx.extras || {};
    const annx = (shot.annotations && shot.annotations.extras) || {};
    if (wfx.basketName && !annx.basketName) {
      shot.annotations = shot.annotations || {};
      shot.annotations.extras = { ...annx, basketId: wfx.basketId, basketName: wfx.basketName };
    }
  }
