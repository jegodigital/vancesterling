import { Config } from '@remotion/cli/config';

// Master encode standard — see CLAUDE.md "Encoding".
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709'); // with JPEG frames this yields yuv420p TV-range (not yuvj420p)
Config.setCrf(18);
Config.setOverwriteOutput(true);
