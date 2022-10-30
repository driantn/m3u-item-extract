import parser, { PlaylistItem } from "iptv-playlist-parser";
import { useNavigate } from "react-router-dom";

export const Root = () => {
  const navigate = useNavigate();
  const onChange = (event: any) => {
    const [file] = event.target.files;
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) return;
      const content = parser.parse(reader.result?.toString());
      const data = content.items.reduce((acc, curr) => {
        const group = curr.group.title || "Other";
        if (acc[group]) {
          acc[group] = [...acc[group], curr];
        } else {
          acc[group] = [curr];
        }
        return acc;
      }, {} as Record<string, Array<PlaylistItem>>);
      let payload = {} as Record<string, Array<PlaylistItem>>;
      const keys = Object.keys(data);
      keys
        .sort((a, b) => a.localeCompare(b))
        .forEach((item) => (payload[item] = data[item]));

      navigate(`/editor/${keys[0]}`, { state: { payload } });
    };

    reader.readAsText(file);
  };
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <input type="file" onChange={onChange} accept=".m3u" name="file" />
    </div>
  );
};
