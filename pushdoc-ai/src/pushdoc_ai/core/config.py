from __future__ import annotations

from pathlib import Path

import yaml
from pydantic import BaseModel, Field, model_validator


class ModelSpec(BaseModel):
    provider: str
    model_id: str
    base_url_env: str
    api_key_env: str
    timeout_s: float = Field(gt=0)
    max_tokens: int = Field(ge=0)
    temperature: float = Field(ge=0, le=2)
    rps: float = Field(gt=0)
    tpm: int = Field(ge=0)
    enabled: bool = True
    dimensions: int | None = Field(default=None, gt=0)
    query_prefix: str = ""
    document_prefix: str = ""


class RoleSpec(BaseModel):
    primary: str
    fallbacks: list[str] = Field(default_factory=list)


class ModelsConfig(BaseModel):
    roles: dict[str, RoleSpec]
    models: dict[str, ModelSpec]

    @model_validator(mode="after")
    def role_models_must_exist(self) -> "ModelsConfig":
        for role, spec in self.roles.items():
            for name in [spec.primary, *spec.fallbacks]:
                if name not in self.models:
                    raise ValueError(f"Role {role!r} references unknown model {name!r}")
        return self


def load_models_config(path: Path | None = None) -> ModelsConfig:
    config_path = path or Path(__file__).parents[3] / "config" / "models.yaml"
    with config_path.open("rb") as handle:
        data = yaml.safe_load(handle)
    return ModelsConfig.model_validate(data)
